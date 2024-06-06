export interface IConfig {
    notion: {
        database_id: string;
    },
    discord: {
        auto_reaction_channel_ids: string[],
        updates: {
            bot_logs: {
                channel_id: string;
                success_roles: string[];
                error_roles: string[];
            },
            eplans: {
                channel_id: string;
                role_id: string;
            }
        }
    },
}