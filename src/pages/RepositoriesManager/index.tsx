import React from 'react';
import {
  AutoComplete,
  Button,
  Card,
  Col,
  Divider,
  Row,
  Statistic,
  notification,
  Progress,
  Popover,
} from 'antd';
import {
  allProjectsSQL,
  commitCountSql,
  developerCountSql,
  issueCountSql,
  prCountSql,
  repoCountSql,
} from '@/pages/RepositoriesManager/DataSQLs';
import { runSql } from '@/services/clickhouse';
import { PageContainer } from '@ant-design/pro-layout';
import { getIntl, Link } from 'umi';
import { addRepository, getRepositories } from '@/services/intelligengine';

const IS_GIT_URL_REGEX =
  /(git:\/\/|git@|http:\/\/|https:\/\/)[.0-9a-zA-Z_\-~:]+[\/:]{1}[0-9a-zA-Z_\-~]+\/{1}[0-9a-zA-Z_\-~.]+(.git){0,1}$/;

const intl = getIntl();

const REPO_DOWNLOADING = 1;
const REPO_DOWNLOADED = 2;
const MAX_DOWNLOADS_TO_SHOW = 100;

const STATUS_SCORES = {
  started: 3,
  queued: 2,
  failed: 1,
};

// TODO Well, there must be thousands of better ways than this nasty one:
const repoJobCompare = (a, b) => {
  let scoreA = STATUS_SCORES[a.job_status] * 10000;
  let scoreB = STATUS_SCORES[b.job_status] * 10000;

  scoreA -= a.owner.toLowerCase().charCodeAt(0) * 10 + a.repo.toLowerCase().charCodeAt(0);
  scoreB -= b.owner.toLowerCase().charCodeAt(0) * 10 + b.repo.toLowerCase().charCodeAt(0);

  return scoreB - scoreA;
};

export default class RepositoriesManager extends React.Component<any, any> {
  repoFound: boolean = false;
  fetchReposInterval = null;

  constructor(props) {
    super(props);
    this.state = {
      repoOptions: [],
      numRepos: -1,
      numDownloadingRepos: 0,
      downloadingRepos: [],
      numCommits: -1,
      numDevelopers: -1,
      numIssues: -1,
      numPRs: -1,
      repoFound: true,
      searchInput: '',
    };

    this.onSearchInputChange = this.onSearchInputChange.bind(this);
    this.onAddRepo = this.onAddRepo.bind(this);
    this.syncDownloadingRepos = this.syncDownloadingRepos.bind(this);

    runSql(allProjectsSQL(), true).then((result) => {
      const repoOptions = result.data.map((item) => ({
        owner: item.search_key__owner,
        repo: item.search_key__repo,
        origin: item.search_key__origin,
        value: `${item.search_key__owner}/${item.search_key__repo}`,
      }));
      this.setState({ repoOptions });
    });

    runSql(repoCountSql()).then((result) => {
      const numRepos = result.data[0][0];
      this.setState({ numRepos });
    });

    runSql(commitCountSql()).then((result) => {
      const numCommits = result.data[0][0];
      this.setState({ numCommits });
    });

    runSql(developerCountSql()).then((result) => {
      const numDevelopers = result.data[0][0];
      this.setState({ numDevelopers });
    });

    runSql(issueCountSql()).then((result) => {
      const numIssues = result.data[0][0];
      this.setState({ numIssues });
    });

    runSql(prCountSql())
      .then((result) => {
        const numPRs = result.data[0][0];
        this.setState({ numPRs });
      })
      .catch((err) => {
        this.setState({ numPRs: 0 });
      });

    this.syncDownloadingRepos();
    this.fetchReposInterval = setInterval(this.syncDownloadingRepos, 5000);
  }

  componentWillUnmount() {
    if (this.fetchReposInterval) {
      clearInterval(this.fetchReposInterval);
    }
  }

  onSearchInputChange(inputValue) {
    // this.repoFound is assigned in a single option match scope, it's NOT accurate
    // we should check it here!
    let repoFound = false;
    for (let i = 0; i < this.state.repoOptions.length; ++i) {
      const option = this.state.repoOptions[i];
      if (
        option!.owner.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1 ||
        option!.repo.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1 ||
        option!.origin.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
      ) {
        repoFound = true;
        break;
      }
    }
    this.setState({ repoFound, searchInput: inputValue });
  }

  onAddRepo(event, retryUrl) {
    const repoUrl = retryUrl ? retryUrl : this.state.searchInput;
    const invalidGitUrlStr = intl.formatMessage({
      id: 'repositoriesManager.invalidGitUrl',
    });
    const failedToAddRepoStr = intl.formatMessage({
      id: 'repositoriesManager.failedToAddRepo',
    });
    if (!IS_GIT_URL_REGEX.test(repoUrl)) {
      return notification.error({
        message: failedToAddRepoStr,
        description: invalidGitUrlStr,
        placement: 'top',
      });
    }

    addRepository(repoUrl)
      .then((result) => {
        this.setState({ searchInput: '' });
        notification.info({
          message: intl.formatMessage({ id: 'repositoriesManager.repoAdded' }),
          description: `Repo ${this.state.searchInput} is added to download list`,
          placement: 'top',
        });
      })
      .catch((e) => {
        const failedToAddStr = intl.formatMessage({ id: 'repositoriesManager.failedToAdd' });
        const alreadyInDownloadListStr = intl.formatMessage({
          id: 'repositoriesManager.repoAlreadyInDownloadList',
        });
        const alreadyDownloadedStr = intl.formatMessage({
          id: 'repositoriesManager.repoAlreadyDownloaded',
        });

        let description = `${failedToAddStr} ${repoUrl}`;
        switch (e.response.status) {
          case 409:
            const repoStatus = e.response.headers.get('repo_status');
            const statusStr =
              repoStatus == REPO_DOWNLOADED ? alreadyDownloadedStr : alreadyInDownloadListStr;
            description = `${description}: ${statusStr}`;
            break;
          case 400:
            description = `${description}: ${invalidGitUrlStr}`;
            break;
          default:
            description = `${description}: ${e}`;
        }

        notification.error({
          message: failedToAddRepoStr,
          description,
          placement: 'top',
        });
      });
  }

  syncDownloadingRepos() {
    getRepositories()
      .then((result) => {
        this.setState({
          downloadingRepos: result.sort(repoJobCompare),
          numDownloadingRepos: result.length,
        });
      })
      .catch((e) => {
        console.log(e);
      });
  }

  render() {
    return (
      <PageContainer>
        <Row>
          <Col span={7}>
            <AutoComplete
              style={{ width: 400 }}
              options={this.state.repoOptions}
              placeholder={intl.formatMessage({ id: 'repositoriesManager.inputTip' })}
              filterOption={(inputValue, option) => {
                return (
                  option!.owner.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1 ||
                  option!.repo.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1 ||
                  option!.origin.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
                );
              }}
              value={this.state.searchInput}
              onSearch={this.onSearchInputChange}
              onSelect={this.onSearchInputChange}
            />
          </Col>
          <Col span={4}>
            {!this.state.repoFound && (
              <Button onClick={this.onAddRepo}>
                {intl.formatMessage({ id: 'repositoriesManager.addButtonTitle' })}
              </Button>
            )}
          </Col>
        </Row>

        <Divider>{intl.formatMessage({ id: 'repositoriesManager.statistics' })}</Divider>
        <Row>
          <Col span={4}>
            <Card>
              <Statistic
                title={intl.formatMessage({ id: 'repositoriesManager.repositories' })}
                value={this.state.numRepos}
                loading={this.state.numRepos == -1}
              />
            </Card>
          </Col>

          <Col span={4}>
            <Card>
              <Statistic
                title={intl.formatMessage({ id: 'repositoriesManager.repositoriesDownloading' })}
                value={this.state.numDownloadingRepos}
                loading={this.state.numDownloadingRepos == -1}
              />
            </Card>
          </Col>

          <Col span={4}>
            <Card>
              <Statistic
                title={intl.formatMessage({ id: 'repositoriesManager.gitCommits' })}
                value={this.state.numCommits}
                loading={this.state.numCommits == -1}
              />
            </Card>
          </Col>

          <Col span={4}>
            <Card>
              <Statistic
                title={intl.formatMessage({ id: 'repositoriesManager.developers' })}
                value={this.state.numDevelopers}
                loading={this.state.numDevelopers == -1}
              />
            </Card>
          </Col>

          <Col span={4}>
            <Card>
              <Statistic
                title={intl.formatMessage({ id: 'repositoriesManager.githubIssues' })}
                value={this.state.numIssues}
                loading={this.state.numIssues == -1}
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card>
              <Statistic
                title={intl.formatMessage({ id: 'repositoriesManager.githubPullRequests' })}
                value={this.state.numPRs}
                loading={this.state.numPRs == -1}
              />
            </Card>
          </Col>
        </Row>

        <Divider>{intl.formatMessage({ id: 'repositoriesManager.repositories' })}</Divider>
        <Row gutter={[10, 10]}>
          {this.state.downloadingRepos.slice(0, MAX_DOWNLOADS_TO_SHOW).map((repoInfo) => {
            const {
              owner,
              repo,
              url: repoUrl,
              job_status: jobStatus,
              gits_status: gitsStatus,
              github_commits_status: ghCommitsStatus,
              github_issues_status: ghIssuesStatus,
              github_issues_comments_status: ghIssuesCommentsStatus,
              github_issues_timeline_status: ghIssuesTimelinStatus,
              github_pull_requests_status: ghPRStatus,
              ck_transfer_status: ckTransferStatus,
              ck_aggregation_status: ckAggregationStatus,
            } = repoInfo;

            const color = 'rgb(245,245,239)';
            let progress = 100;
            const essentialStatuses = [
              gitsStatus,
              ghCommitsStatus,
              ghIssuesStatus,
              ghIssuesCommentsStatus,
              ghIssuesTimelinStatus,
              ghPRStatus,
              ckTransferStatus,
              ckAggregationStatus,
            ];
            const progressInterval = progress / essentialStatuses.length;

            essentialStatuses.forEach((status) => {
              if (status != 2) {
                progress -= progressInterval;
              }
            });

            if (jobStatus === 'queued') {
              return (
                <Col key={`downloading__repo__col__${owner}___${repo}`} span={4}>
                  <a href={repoUrl} target={'_blank'} rel="noreferrer">
                    <Card
                      style={{ height: 90, background: color, borderColor: 'rgb(60,108,60)' }}
                      hoverable
                    >
                      <Row>
                        <Col span={20}> {`${owner}/${repo} (queued)`}</Col>
                      </Row>
                    </Card>
                  </a>
                </Col>
              );
            }

            const progressStatus = jobStatus == 'failed' ? 'exception' : 'normal';

            const progressCard = (
              <Card
                style={{ height: 90, background: color, borderColor: 'rgb(60,108,60)' }}
                hoverable
              >
                <Row>
                  <Col span={20}> {`${owner}/${repo}`}</Col>
                  <Col span={4}>
                    <Progress
                      status={progressStatus}
                      percent={parseInt(progress)}
                      type={'circle'}
                      width={40}
                     />
                  </Col>
                </Row>
              </Card>
            );

            let ret = null;
            if (jobStatus == 'failed') {
              ret = (
                <Popover content={intl.formatMessage({ id: 'repositoriesManager.clickToRetry' })}>
                  <div
                    onClick={(e) => {
                      this.onAddRepo(e, repoUrl);
                    }}
                  >
                    {progressCard}
                  </div>
                </Popover>
              );
            } else {
              ret = (
                <a href={repoUrl} target={'_blank'} rel="noreferrer">
                  {progressCard}
                </a>
              );
            }

            return (
              <Col key={`downloading__repo__col__${owner}___${repo}`} span={4}>
                {ret}
              </Col>
            );
          })}
        </Row>
        <br />
        <Row gutter={[10, 10]}>
          {this.state.repoOptions.map((option) => {
            const { owner, repo } = option;
            const colKey = `col__${owner}__${repo}`;
            return (
              <Col span={4} key={colKey}>
                <Link
                  to={{
                    pathname: '/contrib_distribution',
                    search: `?owner=${owner}&repo=${repo}`,
                  }}
                >
                  <Card style={{ height: 90 }} hoverable>
                    {option.value}
                  </Card>
                </Link>
              </Col>
            );
          })}
        </Row>
      </PageContainer>
    );
  }
}
