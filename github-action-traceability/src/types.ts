enum NoIdVerificationStrategy {
  CASE_INSENSITIVE = 'CASE_INSENSITIVE',
  UPPER_CASE = 'UPPER_CASE',
  LOWER_CASE = 'LOWER_CASE',
  NEVER = 'NEVER',
}

enum CommitVerificationStrategy {
  ALL_COMMITS = 'ALL_COMMITS',
  HEAD_COMMIT_ONLY = 'HEAD_COMMIT_ONLY',
  NEVER = 'NEVER',
}

enum TitleVerificationStrategy {
  ALWAYS = 'ALWAYS',
  IF_EXISTS = 'IF_EXISTS',
  NEVER = 'NEVER',
}

interface TrelloCard {
  id: string;
  checkItemStates: string | null;
  closed: boolean;
  dateLastActivity: string;
  desc: string;
  idBoard: string;
  idShort: number;
  name: string | null;
  shortLink: string;
  dueComplete: boolean;
  due: string | null;
  shortUrl: string;
  url: string;
}

interface TrelloAttachment {
  id: string;
  bytes: string;
  date: string;
  edgeColor: string;
  idMember: string;
  isUpload: boolean;
  mimeType: string;
  name: string;
  previews: [];
  url: string;
  pos: number;
}

interface ghBaseData {
  repoOwner: string;
  repoName: string;
}

interface ghCommentData extends ghBaseData {
  comment: string;
}
interface GhIssueData extends ghBaseData {
  issueNumber: number;
}
interface GhIssueCommentData extends ghCommentData {
  issueNumber: number;
}

interface GhResponseIssueComment {
  id: number;
  node_id: string;
  url: string;
  html_url: string;
  body: string;
  user: {
    login: string;
    id: number;
    node_id: string;
    avatar_url: string;
    gravatar_id: string;
    url: string;
    html_url: string;
    followers_url: string;
    following_url: string;
    gists_url: string;
    starred_url: string;
    subscriptions_url: string;
    organizations_url: string;
    repos_url: string;
    events_url: string;
    received_events_url: string;
    type: string;
    site_admin: boolean;
  };
  created_at: string;
  updated_at: string;
  issue_url: string;
  author_association: string;
}

interface GhCommitEdgeItem {
  node: {
    commit: {
      message: string;
    };
  };
}

interface GhRepositoryResponseData {
  repository: {
    pullRequest: {
      commits: {
        edges: [GhCommitEdgeItem];
      };
    };
  };
}

export {
  NoIdVerificationStrategy,
  CommitVerificationStrategy,
  TitleVerificationStrategy,
  TrelloCard,
  TrelloAttachment,
  GhIssueCommentData,
  GhIssueData,
  GhResponseIssueComment,
  GhCommitEdgeItem,
  GhRepositoryResponseData,
};
