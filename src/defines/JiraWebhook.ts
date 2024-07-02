
/**
 * Jira Webhook 이벤트입니다.
 * 아래 공식 문서 참고
 * https://developer.atlassian.com/server/jira/platform/webhooks/#register-a-webhook (webhook 가이드)
 * https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-issue-search/#api-group-issue-search (jira api 목록)
 * */
export enum JiraWebhookEvent {
    project_created = "project_created", // 프로젝트 생성
    project_updated = "project_updated", // 프로젝트 업데이트
    project_deleted = "project_deleted", // 프로젝트 삭제
    issue_created = "jira:issue_created", // 이슈 생성
    issue_updated = "jira:issue_updated", // 이슈 업데이트
    issue_deleted = "jira:issue_deleted", // 이슈 삭제
    issuelink_created = "issuelink_created", // 이슈 연결
    issuelink_deleted = "issuelink_deleted", // 연결된 이슈 삭제
    worklog_created = "worklog_created", // 작업내역 생성
    worklog_updated = "worklog_updated", // 작업내역 업데이트
    worklog_deleted = "worklog_deleted", // 작업 내역 삭제
    comment_created = "comment_created", // 댓글 등록 (해당 이벤트는 무시함)
    comment_updated = "comment_updated", // 댓글 수정 (해당 이벤트는 무시함)
    comment_deleted = "comment_deleted", // 댓글 삭제 (해당 이벤트는 무시함)
}

/**
 * 프로젝트 상태값 변경 시 유저 데이터 입니다.
 * 추후 user에 필요한 데이터가 있는경우 데이터 타입 추가 할 예정
 * */
export interface JiraUserData {
    displayName: string; //이름
}

/** 프로젝트 댓글 입력시 데이터 입니다. */
export interface JiraCommentData {
    id: string; // 작업내역 id '10002',
    author: { // 댓글을 처음 작성한 사람
        accountId: string; // 계정id '712020:20955c43-0d40-47d5-b100-faf80c0f0327',
        displayName: string; // 계정닉네임 '[TFDT] 최영완',
    },
    body: string; // '댓글글',
    updateAuthor: { // 마지막 업데이트 한 유저 (기존에 있는 댓글을 다른사람이 수정한 경우 마지막 수정한 사람의 데이터)
        accountId: string; // 계정id '712020:20955c43-0d40-47d5-b100-faf80c0f0327',
        displayName: string; // 계정닉네임 '[TFDT] 최영완',
    },
    created: string; // 생성시간 '2024-05-02T17:54:06.140+0900',
    updated: string; // 업데이트 시간 '2024-05-02T17:54:06.140+0900',
}

/** 연결된 이슈 링크 데이터입니다. */
export interface IssuelinksData {
    inwardIssue?: { // 부모이슈 (내가 다른이슈에 물려있는 경우) is blocked by
        id: string;
        key: string;
    }
    outwardIssue?: { // 자식이슈 (다른 이슈가 나를 연결한 경우) blocks
        id: string; // 10001
        key: string; // KAN-2
    }
}

/** 작업내역 로그 생성 데이터입니다.  */
export interface JiraWorkLogData {
    author: { // 작성자
        accountId: string; // 계정id '6423c871b05b4e3e7daba91f',
        displayName: string; // 계정닉네임 '최영완',
    },
    updateAuthor: { // 업데이트 한 사람 (작성자랑 다를수있음)
        accountId: string; // '6423c871b05b4e3e7daba91f',
        displayName: string; // '최영완',
    },
    comment: string; // 내용
    created: string; // 생성 시간 '2024-05-13T12:43:22.170+0900',
    updated: string; // 업데이트 시간 '2024-05-13T12:43:22.170+0900',
    started: string; // 시작 시간 '2024-05-13T11:43:10.479+0900',
    timeSpent: string; // 시간 (문자형) '1h',
    timeSpentSeconds: string; // 시간 (초) 3600,
    id: string; // 등록된 작업 내역 id '10001',
    issueId: string; // 이슈 id '10037'
}

/** 이슈 데이터입니다. */
export interface JiraIssueData {
    id: string; // 이슈 id
    key: string; // 이슈 key(ex KAN - 1)
    fields: { // 이슈 필드 데이터
        project: {
            name: string; // 프로젝트 이름
            projectTypeKey: string; // 프로젝트 타입(software)
        }
        created: string; // 생성 시간 (2024-05-02T15:12:46.375+0900)
        updated: string; // 업데이트 시간 (2024-05-02T15:12:46.375+0900)
        description: string; // 이슈 설명
        summary: string; // 제목
        creator: { // 프로젝트를 생성한 사람
            accountId: string; // 계정id '712020:20955c43-0d40-47d5-b100-faf80c0f0327',
            displayName: string; // 계정닉네임 '[TFDT] 최영완',
        },
        assignee?: { // 담당자 데이터
            accountId: string; // 담당자 키값
            displayName: string; // 담당자 이름
        },
        status: {
            name: string // 상태값(In Progress, Complete)
            statusCategory: { // 자세한 상태 데이터
                id: string; // 상태값에 해당하는 키값(진행중, 완료 등)
                name: string; //상태값(In Progress)
                colorName: string;// 상태 라벨 색상
            }
        },
        issuelinks?: IssuelinksData[]; // 연결된 이슈 링크들
        parent?: { // 상위 항목
            id: string;
            key: string;
        }

        // 테스트용 지라에서는 순서를 바꿔도, 옵션을 바꿔도 10015로 오는데 투네이션 지라에서는 다르게 올수도있음 테스트해봐야함
        customfield_10015?: string; // Start Date
    }
}

/** 이슈 연결 관련 데이터입니다. (이슈 연결 삭제 시) */
export interface JiraIssueLinkData {
    id: string;
    sourceIssueId: string; // 연결되거나 삭제한 이슈 id (inwardIssue)
    destinationIssueId: string; // 자기 자신 id (outwardIssue)
}

/** 지라 웹훅 데이터입니다. */
export interface JiraWebhookData {
    timestamp: number; // 이벤트 시간
    webhookEvent: JiraWebhookEvent; //이벤트 이름
    user?: JiraUserData; // 유저 데이터
    comment?: JiraCommentData; // 댓글 데이터
    issue?: JiraIssueData; // 이슈 데이터
    issueLink?: JiraIssueLinkData; // 이슈 링크 삭제 시 데이터
    worklog?: JiraWorkLogData; // 작업 내역 생성 및 업데이트 시 데이터
}
