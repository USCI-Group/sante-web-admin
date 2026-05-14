import type { Meta } from "./common"

export interface PushNotificationTemplate {
    id: string,
    title: string,
    message: string,
    business_id: string,
    business?: null,
    created_at: string,
    updated_at: string,
    deleted_at: string 
}

export interface PushNotificationTemplateListResponse {
    meta: Meta,
    data: PushNotificationTemplate[],
}

export interface PushNotificationTemplateResponse {
    message: string,
    data: PushNotificationTemplate,
}

export interface PushNotificationTemplateRequest {
    title: string,
    message: string,
    business_id?: string
}

export interface PushNotificationTemplateListRequest {
    business_id: string,
    page: number,
    page_size: number
}

export interface SendNotificationRequest {
    title: string,
    message: string,
    business_id: string
}