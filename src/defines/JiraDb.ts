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
}

/** 지라 프로젝트에 연결된 링크 테이블의 DB 데이터입니다. */
export interface JiraProjectLinksDBData {
    id: string; // 본인 프로젝트 id입니다.
    link_project_id: string; // 연결된 프로젝트 id입니다.
}