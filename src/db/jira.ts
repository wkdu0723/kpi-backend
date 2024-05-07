import mysql from "mysql";
import { JiraProjectDBData, JiraProjectLinksDBData } from "../defines/JiraDb";

// 연결 풀 설정
const pool = mysql.createPool({
    host: "toonation-dev2.ctcsrsvpq9nu.ap-northeast-2.rds.amazonaws.com",
    user: "root",
    password: "xhdzmsdkdl_toothlife",
    database: "toonation_kpi",
    charset: "utf8mb4",
    port: 3307
});

/** 프론트팀이 담당자로 되어있는 모든 지라프로젝트를 가지고옵니다. */
export const getJiraProject = async (): Promise<JiraProjectDBData[]> => {
    return new Promise((resolve, reject) => {
        pool.query("SELECT * FROM jira_main", (err, results) => {
            if (err) {
                console.error("쿼리 실행 오류:", err);
                reject([]);
            } else {
                console.log("쿼리 결과:", results);
                resolve(results);
            }
        });
    });
}

/** 프론트팀이 담당자로 되어있는 지라 프로젝트를 생성합니다. */
export const setJiraProject = async (data: JiraProjectDBData): Promise<void> => {
    const { id, project_key, project_name, project_type, created, updated, description, summary, assignee_account_id, assignee_display_name,
        status_name, status_category_id, status_category_name, status_category_color } = data;

    const query = `
        INSERT INTO jira_main (
            id,
            project_key,
            project_name,
            project_type,
            created,
            updated,
            description,
            summary,
            assignee_account_id,
            assignee_display_name,
            status_name,
            status_category_id,
            status_category_name,
            status_category_color
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
            project_key = VALUES(project_key),
            project_name = VALUES(project_name),
            project_type = VALUES(project_type),
            created = VALUES(created),
            updated = VALUES(updated),
            description = VALUES(description),
            summary = VALUES(summary),
            assignee_account_id = VALUES(assignee_account_id),
            assignee_display_name = VALUES(assignee_display_name),
            status_name = VALUES(status_name),
            status_category_id = VALUES(status_category_id),
            status_category_name = VALUES(status_category_name),
            status_category_color = VALUES(status_category_color);
    `;

    const values = [
        id,
        project_key,
        project_name,
        project_type,
        created,
        updated,
        description,
        summary,
        assignee_account_id,
        assignee_display_name,
        status_name,
        status_category_id,
        status_category_name,
        status_category_color,
    ];

    return new Promise((resolve, reject) => {
        pool.query(query, values, (err, results) => {
            if (err) {
                console.error('쿼리 실행 오류:', err);
                reject(err);
            } else {
                console.log('쿼리 실행 결과:', results);
                resolve(results);
            }
        });
    });
}


/** 지라 프로젝트에 연결된 링크들을 저장합니다. */
export const setJiraProjectLinks = async (data: JiraProjectLinksDBData[]): Promise<void> => {
    const values = data.map(item => `('${item.id}', '${item.link_project_id}', '${item.link_project_key}', '${item.link_project_account_id}', '${item.link_project_account_name}')`).join(', ');
    const query = `
            INSERT INTO jira_links (id, link_project_id, link_project_key, link_project_account_id, link_project_account_name)
            VALUES ${values}
            ON DUPLICATE KEY UPDATE
            link_project_id = VALUES(link_project_id),
            link_project_key = VALUES(link_project_key),
            link_project_account_id = VALUES(link_project_account_id),
            link_project_account_name = VALUES(link_project_account_name);
        `;

    return new Promise((resolve, reject) => {
        pool.query(query, (err, results) => {
            if (err) {
                console.error('쿼리 실행 오류:', err);
            } else {
                console.log('데이터 삽입/업데이트 성공:', results);
            }
        });
    });
}