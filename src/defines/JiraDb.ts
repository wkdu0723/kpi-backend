/** 지라 프로젝트 DB 데이터입니다. */
export interface JiraProjectDBData {
    id: string;
    project_key: string;
    project_name: string;
    project_type: string;
    created: string;
    updated: string;
    description: string;
    summary: string;
    assignee_account_id: string;
    assignee_display_name: string;
    status_name: string;
    status_category_id: string;
    status_category_name: string;
    status_category_color: string;
    parent?: { // 상위 항목
        id: string;
        key: string;
    }
}

/** 지라 프로젝트에 연결된 링크 테이블의 DB 데이터입니다. */
export interface JiraProjectLinksDBData {
    // 부모이슈 (내가 다른이슈에 물려있는 경우)
    inward_issue_id: string;
    inward_issue_key?: string; // 단일연결할땐 key값이 없어서 추후 사용하기 위해서는 id로 조회해야함.
    // 자식이슈 (다른 이슈가 나를 연결한 경우)
    outward_issue_id: string;
    outward_issue_key?: string; // 단일연결할땐 key값이 없어서 추후 사용하기 위해서는 id로 조회해야함.
}