const NotionColumns = {
    publish: {
        column: "Publish",
        val_no_details: "Publish date no details",
        val_details: "Publish details",
    },
}


const NotionFilters = {
    MEMBER_NEXT_MONTH: {
        "and": [
            {
                property: "Type",
                "multi_select": {
                    "contains": "Member",
                }
            },
            {
                property: "Date",
                date: {
                    next_month: {}
                }

            },
            {
                "or": [
                    {
                        property: NotionColumns.publish.column,
                        "status": {
                            "equals": NotionColumns.publish.val_no_details
                        }
                    },
                    {
                        property: NotionColumns.publish.column,
                        "status": {
                            "equals": NotionColumns.publish.val_details
                        }
                    }
                ]
            }
        ]
    }
}

export default NotionFilters;
export { NotionColumns }