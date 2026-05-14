import type { Membership, MembershipBenefit, MembershipUpgradeRule, Mission, MissionCriteria, MissionReward, Voucher, VoucherEligibilityRule, VoucherRequiredInputs } from '@/types/membership'
import type { Meta, Option, OptionWithValue } from '~/types/common'
import type { Outlet } from '~/types/outlet';
import type { RankRequiredInputs, MembershipGeneralSettings, PointRule } from '@/types/membership';

// input for create mission
export const useMembership = () => {
    const config = useRuntimeConfig()
    const baseUrl = config.public.apiUrl
    const { token } = useAuth()

    const headers = {
        'Authorization': `${token.value}`,
        'Content-Type': 'application/json'
    }
    
    const createVoucher = async (body: {
        // HTTP body
        "voucher_id"?: string,
        "business_id": string,
        "membership_id"?: string,
        "name": string,
        "description"?: string,
        "voucher_code"?: string,
        "voucher_image_url"?: string,
        "voucher_for"?: string,
        "voucher_type": string,
        "min_purchase"?: number,
        "max_purchase"?: number,
        "max_redemption"?: number,
        "max_redemption_per_customer"?: number,
        "current_redemptions"?: number,
        "current_usage"?: number,
        "redeem_value"?: number,
        "is_active": boolean,
        "discount_id"?: string,
        "is_eligible_for_ranking_climb"?: boolean,
        "valid_from"?: string,
        "valid_to"?: string,
        "discount_type"?: string,
        "discount_value"?: number,
        "is_stackable"?: boolean,
        "is_exclusive"?: boolean,
        "is_one_time_use"?: boolean,
        "is_mobile_app_only"?: boolean,
        "priority"?: number,
        "eligible_order_method"?: string,
        "eligible_platform"?: string,
        "terms_and_conditions"?: string,
        "applicable_outlets"?: string[]
      	"eligible_user_type": string,
        "voucher_eligibility_rules"?: VoucherEligibilityRule[],
        "product_id"?: string,
        "giveaway_amount"?: number,
    }) => {
        if (body.giveaway_amount) {
            body.giveaway_amount = Number(body.giveaway_amount)
        }

        try {
            const res = await $fetch<Voucher>(`/api/business/membership/voucher/create`, {
                baseURL: baseUrl,
                headers,
                method: 'POST',
                body
            })
            return res
        } catch (error) {
            throw error
        }
    }

    const updateVoucher = async (voucher: Voucher) => {
        try {
            const res = await $fetch(`/api/business/membership/voucher/update`, {
                baseURL: baseUrl,
                headers,
                method: 'POST',
                body: voucher
            })
        } catch (error) {
            throw error
        }
    }

    const queryVoucherList = async (body: {
        "business_id": string,
        "filters"?: {
            search?: string,
            voucher_type?: string,
            voucher_for?: string,
            is_one_time_use?: boolean,
        },
        "page"?: number,
        "page_size"?: number
    }) => {

        try {
            const { data, meta } = await $fetch<{
                data: Voucher[],
                meta: Meta
            }>('/api/business/membership/voucher/get', {
                baseURL: baseUrl,
                headers,
                method: 'POST',
                body
            })
            return { data, meta }
        } catch (error) {
            throw error
        }
    }

    const deleteVoucher = async (body: {
        business_id: string,
        voucher_id: string
    }) => {
        try {
            const res = await $fetch(`/api/business/membership/voucher/delete`, {
                baseURL: baseUrl,
                headers,
                method: 'POST',
                body
            })
        } catch (error) {
            throw error
        }
    }

    const deleteVoucherEligibilityRule = async (voucher_eligibility_rule_id: string) => {
        try {
            const res = await $fetch(`/api/business/membership/voucher/eligibility-rule/delete/${voucher_eligibility_rule_id}`, {
                baseURL: baseUrl,
                headers,
                method: 'DELETE',
            })
            return res
        } catch (error) {
            throw error
        }
    }

    const uploadVoucherImage = async (body: {
        voucher_id: string,
        file?: File,
    }) => {
        try {
            const formData = new FormData()
            formData.append('voucher_id', body.voucher_id)
            if (body.file) {
                formData.append('file', body.file)
            }

            const res = await $fetch(`/api/business/membership/voucher/upload-image`, {
                baseURL: baseUrl,
                headers: {
                    'Authorization': `${token.value}`,
                },
                method: 'POST', 
                body: formData
            })
            return res
        } catch (error) {
            throw error
        }
    }

    const queryVoucherDetails = async (voucher_id: string) => {
        try {
            const res = await $fetch<Voucher>(`/api/business/membership/voucher/get/${voucher_id}`, {
                baseURL: baseUrl,
                headers,
                method: 'GET',
            })
            return res
        } catch (error) {
            throw error
        }
    }

    const queryVoucherRequiredInputs = async (business_id: string) => {
        try {
            const res = await $fetch<VoucherRequiredInputs>(`/api/business/membership/voucher/get-required-inputs/${business_id}`, {
                baseURL: baseUrl,
                headers,
                method: 'GET',
            })
            return res
        } catch (error) {
            throw error
        }
    }

    const queryMembershipList = async (business_id: string) => {
        try {
            const { memberships_data } = await $fetch<{ memberships_data: Membership[] }>(`/api/business/membership/get-memberships/${business_id}`, {
                baseURL: baseUrl,
                headers,
                method: 'GET',
            })
            return memberships_data
        } catch (error) {
            throw error
        }
    }

    const createMembership = async (body: {
        business_id: string,
        tier_name: string,
        file?: File,
        upgrade_value?: number,
    }) => {
        try {
            const formData = new FormData()
            formData.append('business_id', body.business_id)
            formData.append('tier_name', body.tier_name)
            if (body.upgrade_value) {
                formData.append('upgrade_value', body.upgrade_value.toString())
            }
            if (body.file) {
                formData.append('file', body.file)
            }

            const res = await $fetch<Membership>(`/api/business/membership/create`, {
                baseURL: baseUrl,
                headers: {
                    'Authorization': `${token.value}`,
                },
                method: 'POST',
                body: formData
            })
            return res
        } catch (error) {
            throw error
        }
    }

    const updateMembership = async (body: {
        tier_id: string,
        tier_name: string,
        file?: File,
    }) => {
        try {
            const formData = new FormData()
            formData.append('tier_id', body.tier_id)
            formData.append('tier_name', body.tier_name)
            if (body.file) {
                formData.append('file', body.file)
            }

            const res = await $fetch<Membership>(`/api/business/membership/update`, {
                baseURL: baseUrl,
                headers: {
                    'Authorization': `${token.value}`,
                },
                method: 'POST',
                body: formData
            })
            return res
        } catch (error) {
            throw error
        }
    }

    const deleteMembership = async (membership_id: string) => {
        try {
            const res = await $fetch(`/api/business/membership/delete-membership/${membership_id}`, {
                baseURL: baseUrl,
                headers,
                method: 'DELETE',
            })
            return res
        } catch (error) {
            throw error
        }
    }

    const queryMembershipDetails = async (membership_id: string) => {
        try {
            const res = await $fetch<Membership>(`/api/business/membership/get/${membership_id}`, {
                baseURL: baseUrl,
                headers,
                method: 'GET',
            })
            return res
        } catch (error) {
            throw error
        }
    }

    const createMembershipUpgradeRule = async (body: {
        "membership_id": string,
        "method": string,
        "upgrade_rule_name": string,
        "upgrade_rule_value": number,
        "review_period": string,
        "product_id"?: string,
    }) => {
        try {
            const res = await $fetch<MembershipUpgradeRule>(`/api/business/membership/upgrade-rules/create`, {
                baseURL: baseUrl,
                headers,
                method: 'POST',
                body
            })
            return res
        } catch (error) {
            throw error
        }
    }
    
    const updateMembershipUpgradeRule = async (body: MembershipUpgradeRule) => {
        try {
            const res = await $fetch<MembershipUpgradeRule>(`/api/business/membership/upgrade-rules/update`, {
                baseURL: baseUrl,
                headers,
                method: 'POST',
                body
            })
            return res
        } catch (error) {
            throw error
        }
    }

    const createMembershipBenefit = async (body: {
        business_id: string,
        membership_id: string,
        benefit_name: string,
        benefit_description: string,
        benefit_type: string,
        point_type?: string,
        point_value?: number,
        file: File,
    }) => {
        const formData = new FormData()
        formData.append('business_id', body.business_id)
        formData.append('membership_id', body.membership_id)
        formData.append('benefit_name', body.benefit_name)
        formData.append('benefit_description', body.benefit_description)
        formData.append('benefit_type', body.benefit_type)
        if (body.point_type) {
            formData.append('point_type', body.point_type)
        }
        if (body.point_value) {
            formData.append('point_value', body.point_value.toString())
        }
        formData.append('file', body.file)

        try {
            const res = await $fetch(`/api/business/membership/benefits/create`, {
                baseURL: baseUrl,
                headers: {
                    'Authorization': `${token.value}`,
                },
                method: 'POST',
                body: formData
            })
            return res
        } catch (error) {
            throw error
        }
    }

    const updateMembershipBenefit = async (body: {
        business_id: string,
        benefit_id: string,
        benefit_name: string,
        benefit_description: string,
        benefit_type: string,
        point_type?: string,
        point_value?: number,
        file?: File,
    }) => {
        const formData = new FormData()
        formData.append('business_id', body.business_id)
        formData.append('benefit_id', body.benefit_id)
        formData.append('benefit_name', body.benefit_name)
        formData.append('benefit_description', body.benefit_description)
        formData.append('benefit_type', body.benefit_type)
        if (body.point_type) {
            formData.append('point_type', body.point_type)
        }
        if (body.point_value) {
            formData.append('point_value', body.point_value.toString())
        }
        if (body.file) {
            formData.append('file', body.file)
        }

        try {
            const res = await $fetch(`/api/business/membership/benefits/update`, {
                baseURL: baseUrl,
                headers: {
                    'Authorization': `${token.value}`,
                },
                method: 'POST',
                body: formData
            })
            return res
        } catch (error) {
            throw error
        }
    }

    const deleteMembershipBenefit = async (benefit_id: string) => {
        try {
            const res = await $fetch(`/api/business/membership/benefits/delete/${benefit_id}`, {
                baseURL: baseUrl,
                headers,
                method: 'DELETE',
            })
            return res
        } catch (error) {
            throw error
        }
    }

    const queryRankRequiredInputs = async (business_id: string) => {
        try {
            const res = await $fetch<RankRequiredInputs>(`/api/business/membership/rank/get-required-inputs/${business_id}`, {
                baseURL: baseUrl,
                headers,
                method: 'GET',
            })
            return res
        } catch (error) {
            throw error
        }
    }

    const createMission = async (body: Mission) => {
        try {
            const res = await $fetch<Mission>(`/api/business/membership/mission/create`, {
                baseURL: baseUrl,
                headers,
                method: 'POST',
                body
            })
            return res
        } catch (error) {
            throw error
        }
    }
    
    const queryMissionList = async (body: {
        "business_id": string,
        "filters"?: {
            search?: string,
            valid_from?: string,
            valid_to?: string,
        },
        "page"?: number,
        "page_size"?: number
    }) => {

        try {
            const { data, meta } = await $fetch<{
                data: Mission[],
                meta: Meta
            }>('/api/business/membership/mission/get', {
                baseURL: baseUrl,
                headers,
                method: 'POST',
                body
            })
            return { data, meta }
        } catch (error) {
            throw error
        }
    }

    const queryMissionDetails = async (mission_id: string) => {
        try {
            const res = await $fetch<Mission>(`/api/business/membership/mission/get/${mission_id}`, {
                baseURL: baseUrl,
                headers,
                method: 'GET',
            })
            return res
        } catch (error) {
            throw error
        }
    }

    const queryMissionRequiredInputs = async (business_id: string) => {
        try {
            const res = await $fetch<{
                product_options: Option[],
                outlet_options: Option[],
                membership_tier_options: Option[],
                mission_reward_type_options: OptionWithValue[],
                point_rule_options: Option[],
                voucher_options: Option[],
                mission_frequency_options: OptionWithValue[],
            }>(`/api/business/membership/mission/get-required-inputs/${business_id}`, {
                baseURL: baseUrl,
                headers,
                method: 'GET',
            })
            return res
        } catch (error) {
            throw error
        }
    }

    const updateMission = async (body: Mission) => {
        try {
            const res = await $fetch<Mission>(`/api/business/membership/mission/update`, {
                baseURL: baseUrl,
                headers,
                method: 'POST',
                body
            })
            return res
        } catch (error) {
            throw error
        }
    }

    const deleteMission = async (mission_id: string) => {
        try {
            const res = await $fetch(`/api/business/membership/mission/delete/${mission_id}`, {
                baseURL: baseUrl,
                headers,
                method: 'DELETE',
            })
            return res
        } catch (error) {
            throw error
        }
    }

    const uploadMissionImage = async (body: {
        mission_id: string,
        file?: File,
    }) => {
        try {
            const formData = new FormData()
            formData.append('mission_id', body.mission_id)
            if (body.file) {
                formData.append('file', body.file)
            }

            const res = await $fetch(`/api/business/membership/mission/upload-image`, {
                baseURL: baseUrl,
                headers: {
                    'Authorization': `${token.value}`,
                },
                method: 'POST', 
                body: formData
            })
            return res
        } catch (error) {
            throw error
        }
    }

    const deleteMissionCriteria = async (mission_criteria_id: string) => {
        try {
            const res = await $fetch(`/api/business/membership/mission/criteria/${mission_criteria_id}`, {
                baseURL: baseUrl,
                headers,
                method: 'DELETE',
            })
            return res
        } catch (error) {
            throw error
        }
    }

    const deleteMissionReward = async (mission_reward_id: string) => {
        try {
            const res = await $fetch(`/api/business/membership/mission/reward/${mission_reward_id}`, {
                baseURL: baseUrl,
                headers,
                method: 'DELETE',
            })
            return res
        } catch (error) {
            throw error
        }
    }

    const queryRankingStats = async (business_id: string) => {
        try {
            const res = await $fetch<{
                total_active_customers:   number;
                total_inactive_customers: number;
                total_customers: number;
            }>(`/api/customers/membership/rank-stats/get/${business_id}`, {
                baseURL: baseUrl,
                headers,
                method: 'GET',
            })
            return res
        } catch (error) {
            throw error
        }
    }

    const queryRankingGeneralSettings = async (business_id: string) => {
        try {
            const res = await $fetch<MembershipGeneralSettings>(`/api/business/membership/general-settings/get/${business_id}`, {
                baseURL: baseUrl,
                headers,
                method: 'GET',
            })
            return res
        } catch (error) {
            throw error
        }
    }

    const saveRankingGeneralSettings = async (body: MembershipGeneralSettings) => {
        try {
            const res = await $fetch(`/api/business/membership/general-settings/save`, {
                baseURL: baseUrl,
                headers,
                method: 'POST',
                body
            })
            return res
        } catch (error) {
            throw error
        }
    }

    const queryDailyCheckInRules = async (business_id: string) => {
        try {
            const res = await $fetch<{ point_rules: PointRule[] }>(`/api/business/points/get-daily-check-in/${business_id}`, {
                baseURL: baseUrl,
                headers,
                method: 'GET',
            })
            return res
        }
        catch (error) {
            throw error
        }
    }

    const createDailyCheckInRule = async (body: PointRule) => {
        try {
            const res = await $fetch(`/api/business/points/add-points-rules`, {
                baseURL: baseUrl,
                headers,
                method: 'POST',
                body
            })
            return res
        } catch (error) {
            throw error
        }
    }

    const updateDailyCheckInRule = async (body: PointRule) => {
        try {
            const res = await $fetch(`/api/business/points/update-daily-check-in`, {
                baseURL: baseUrl,
                headers,
                method: 'POST',
                body
            })
        }
        catch (error) {
            throw error
        }
    }

    const deactivateDailyCheckInRule = async (body: PointRule) => {
        try {
            const res = await $fetch(`/api/business/points/deactivate-daily-check-in`, {
                baseURL: baseUrl,
                headers,
                method: 'POST',
                body
            })
            return res
        }
        catch (error) {
            throw error
        }
    }

    return {
        createVoucher,
        updateVoucher,
        queryVoucherList,
        deleteVoucher,
        uploadVoucherImage,
        queryVoucherDetails,
        queryVoucherRequiredInputs,
        deleteVoucherEligibilityRule,
        queryMembershipList,
        createMembership,
        queryMembershipDetails,
        updateMembership,
        deleteMembership,
        createMembershipUpgradeRule,
        updateMembershipUpgradeRule,
        createMembershipBenefit,
        updateMembershipBenefit,
        deleteMembershipBenefit,
        queryRankRequiredInputs,
        createMission,
        updateMission,
        uploadMissionImage,
        queryMissionList,
        queryMissionRequiredInputs,
        queryMissionDetails,
        deleteMissionCriteria,
        deleteMissionReward,
        deleteMission,
        queryRankingStats,
        queryRankingGeneralSettings,
        saveRankingGeneralSettings,
        queryDailyCheckInRules,
        createDailyCheckInRule,
        updateDailyCheckInRule,
        deactivateDailyCheckInRule
    }
}