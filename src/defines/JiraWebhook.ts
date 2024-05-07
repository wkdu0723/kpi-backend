
/** 프로젝트 상태값 변경 시 유저 데이터 입니다. */
export interface JiraUserData {
    displayName: string; //이름
}

/** 프로젝트 댓글 입력시 데이터 입니다. */
export interface JiraCommentData {
    id: string; // '10002',
    author: { // 댓글을 처음 작성한 사람
        accountId: string; // '712020:20955c43-0d40-47d5-b100-faf80c0f0327',
        displayName: string; // '[TFDT] 최영완',
    },
    body: string; // '댓글글',
    updateAuthor: { // 마지막 업데이트 한 유저 (기존에 있는 댓글을 다른사람이 수정한 경우 마지막 수정한 사람의 데이터)
        accountId: string; //'712020:20955c43-0d40-47d5-b100-faf80c0f0327',
        displayName: string; //'[TFDT] 최영완',
    },
    created: string; // '2024-05-02T17:54:06.140+0900',
    updated: string; // '2024-05-02T17:54:06.140+0900',
}

/** 지라 웹훅 데이터입니다. */
export interface JiraWebhookData {
    timestamp: number; // 이벤트 시간
    webhookEvent: string; //이벤트 이름
    user?: JiraUserData;
    comment?: JiraCommentData;
    issue: { // 이슈 데이터
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
                accountId: string; // '712020:20955c43-0d40-47d5-b100-faf80c0f0327',
                displayName: string; //'[TFDT] 최영완',
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
            issuelinks?: [
                { // 연결된 이슈 링크들
                    outwardIssue: { //
                        id: string; // 10001
                        key: string; // KAN-2
                    }
                }
            ],
        }
    }
}
