declare const _default: {
    data: {
        id: number;
        created_at: string;
        name: string;
        slug: string;
        status: number;
        address: string;
        city: string;
        state: string;
        country: string;
        zip: number;
        distance: null;
        type: string;
        phone: string;
        phone_formatted: string;
        lat: number;
        lon: number;
        description: string;
        website: string;
        notes: string;
        details: {
            data: {
                id: number;
                group: string;
                key: string;
                value: string;
            }[];
        };
        media: {
            data: {
                id: number;
                type: string;
                url: string;
                created_at: string;
                updated_at: string;
            }[];
        };
        meta: {
            data: {
                id: number;
                group: string;
                key: string;
                value: string;
            }[];
        };
    }[];
    meta: {
        pagination: {
            total: number;
            count: number;
            per_page: number;
            current_page: number;
            total_pages: number;
            links: {
                next: string;
            };
        };
    };
};
export default _default;
