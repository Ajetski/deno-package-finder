/* eslint-disable @typescript-eslint/naming-convention */
export type PackagesDto = {
	success: true,
	data: {
		total_count: number,
		options: {
			limit: number,
			page: number,
			query: string,
		sort: string,
		},
		results: [
			{
				name: string,
				description: string,
				star_count: number,
				search_score: number,
			},
			{
				name: string,
				description: string,
				star_count: number,
				search_score: number,
			},
			{
				name: string,
				description: string,
				star_count: number,
				search_score: number,
			}
		]
	}
};
