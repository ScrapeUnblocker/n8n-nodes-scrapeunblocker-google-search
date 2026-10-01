import type {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	JsonObject,
} from 'n8n-workflow';
import { NodeApiError, NodeConnectionTypes, NodeOperationError } from 'n8n-workflow';

import type { OptionField, OutputShape } from './GenericFunctions';
import { applyOptions, requireString, runActorAndGetItems, shapeItems } from './GenericFunctions';

// ScrapeUnblocker's public "Google Search Scraper" Actor: https://apify.com/scrapeunblocker/google-search-scraper
const ACTOR_ID = 'dJjaaOUxwQU6i7F1f';
const INTEGRATION_APP_ID = 'scrapeunblocker-google-search-scraper';

// Node option name -> Actor input key.
const OPTION_FIELDS: Record<string, OptionField> = {
	proxyCountry: {
		key: 'proxy_country',
	},
	includeAds: {
		key: 'include_ads',
	},
	includeAiOverview: {
		key: 'include_ai_overview',
	},
	waitAfterLoad: {
		key: 'wait_after_load',
	},
};

// "resource:operation" -> fields kept by Simplify (dot paths are flattened: a.b -> aB).
const OUTPUT_SHAPES: Record<string, OutputShape> = {};

function buildActorInput(
	this: IExecuteFunctions,
	resource: string,
	operation: string,
	options: IDataObject,
	itemIndex: number,
): IDataObject {
	const input: IDataObject = {};

	switch (`${resource}:${operation}`) {
		case 'result:search': {
			input.keyword = requireString.call(this, 'keyword', 'Search Query', itemIndex);
			input.pages_to_check = this.getNodeParameter('pagesToCheck', itemIndex);
			break;
		}
		default:
			throw new NodeOperationError(
				this.getNode(),
				`The operation '${operation}' is not supported for resource '${resource}'`,
				{ itemIndex },
			);
	}

	applyOptions(input, options, OPTION_FIELDS);
	return input;
}

export class GoogleSearchScraper implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Google Search Scraper',
		name: 'googleSearchScraper',
		icon: {
			light: 'file:googleSearchScraper.png',
			dark: 'file:googleSearchScraper.dark.png',
		},
		group: ['input'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description:
			'Search Google and get organic results, ads and the AI Overview with the ScrapeUnblocker Actor on Apify',
		defaults: {
			name: 'Google Search Scraper',
		},
		usableAsTool: true,
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'apifyApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Result',
						value: 'result',
					},
				],
				default: 'result',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['result'],
					},
				},
				options: [
					{
						name: 'Search',
						value: 'search',
						description: 'Find the organic results, ads and AI Overview Google shows for a query',
						action: 'Search results',
					},
				],
				default: 'search',
			},
			{
				displayName: 'Search Query',
				name: 'keyword',
				type: 'string',
				required: true,
				default: '',
				placeholder: 'e.g. espresso machine',
				description:
					'The Google search query. Search operators such as site:, intitle: and quotes are supported.',
				displayOptions: {
					show: {
						resource: ['result'],
						operation: ['search'],
					},
				},
			},
			{
				displayName: 'Result Pages',
				name: 'pagesToCheck',
				type: 'number',
				typeOptions: {
					minValue: 1,
					maxValue: 10,
				},
				default: 1,
				description:
					'How many result pages to fetch (1-10). Each page returns about 10 organic results.',
				displayOptions: {
					show: {
						resource: ['result'],
						operation: ['search'],
					},
				},
			},
			{
				displayName: 'Options',
				name: 'options',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				options: [
					{
						displayName: 'Include Ads',
						name: 'includeAds',
						type: 'boolean',
						default: true,
						description:
							'Whether to also return the paid results shown above and below the organic list',
					},
					{
						displayName: 'Include AI Overview',
						name: 'includeAiOverview',
						type: 'boolean',
						default: true,
						description:
							"Whether to also return Google's AI Overview block (first page only) when Google shows one",
					},
					{
						displayName: 'Search From Country',
						name: 'proxyCountry',
						type: 'options',
						options: [
							{
								name: 'Austria (AT)',
								value: 'AT',
							},
							{
								name: 'Belgium (BE)',
								value: 'BE',
							},
							{
								name: 'Brazil (BR)',
								value: 'BR',
							},
							{
								name: 'Bulgaria (BG)',
								value: 'BG',
							},
							{
								name: 'Canada (CA)',
								value: 'CA',
							},
							{
								name: 'China (CN)',
								value: 'CN',
							},
							{
								name: 'Croatia (HR)',
								value: 'HR',
							},
							{
								name: 'Denmark (DK)',
								value: 'DK',
							},
							{
								name: 'Estonia (EE)',
								value: 'EE',
							},
							{
								name: 'France (FR)',
								value: 'FR',
							},
							{
								name: 'Germany (DE)',
								value: 'DE',
							},
							{
								name: 'Greece (GR)',
								value: 'GR',
							},
							{
								name: 'Hong Kong (HK)',
								value: 'HK',
							},
							{
								name: 'Ireland (IE)',
								value: 'IE',
							},
							{
								name: 'Israel (IL)',
								value: 'IL',
							},
							{
								name: 'Italy (IT)',
								value: 'IT',
							},
							{
								name: 'Japan (JP)',
								value: 'JP',
							},
							{
								name: 'Latvia (LV)',
								value: 'LV',
							},
							{
								name: 'Lithuania (LT)',
								value: 'LT',
							},
							{
								name: 'Luxembourg (LU)',
								value: 'LU',
							},
							{
								name: 'Moldova (MD)',
								value: 'MD',
							},
							{
								name: 'Netherlands (NL)',
								value: 'NL',
							},
							{
								name: 'Norway (NO)',
								value: 'NO',
							},
							{
								name: 'Poland (PL)',
								value: 'PL',
							},
							{
								name: 'Random',
								value: '',
							},
							{
								name: 'Romania (RO)',
								value: 'RO',
							},
							{
								name: 'Serbia (RS)',
								value: 'RS',
							},
							{
								name: 'Singapore (SG)',
								value: 'SG',
							},
							{
								name: 'South Korea (KR)',
								value: 'KR',
							},
							{
								name: 'Spain (ES)',
								value: 'ES',
							},
							{
								name: 'Sweden (SE)',
								value: 'SE',
							},
							{
								name: 'Switzerland (CH)',
								value: 'CH',
							},
							{
								name: 'Taiwan (TW)',
								value: 'TW',
							},
							{
								name: 'Thailand (TH)',
								value: 'TH',
							},
							{
								name: 'Turkey (TR)',
								value: 'TR',
							},
							{
								name: 'United Kingdom (GB)',
								value: 'GB',
							},
							{
								name: 'United States (US)',
								value: 'US',
							},
						],
						default: '',
						description: 'The country the search runs from. Random picks one automatically.',
					},
					{
						displayName: 'Timeout (Seconds)',
						name: 'timeout',
						type: 'number',
						typeOptions: {
							minValue: 0,
						},
						default: 0,
						description:
							"How long the Apify run may take, in seconds. 0 uses the Actor's default. If the time runs out, the node stops.",
					},
					{
						displayName: 'Wait After Load (Seconds)',
						name: 'waitAfterLoad',
						type: 'number',
						typeOptions: {
							minValue: 0,
							maxValue: 30,
						},
						default: 0,
						description:
							'Extra pause after the results page loads, before it is parsed (0-30). Usually not needed.',
					},
				],
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			try {
				const resource = this.getNodeParameter('resource', i) as string;
				const operation = this.getNodeParameter('operation', i) as string;
				const options = this.getNodeParameter('options', i, {}) as IDataObject;
				const { timeout, ...actorOptions } = options;

				const input = buildActorInput.call(this, resource, operation, actorOptions, i);
				const { items: results } = await runActorAndGetItems.call(this, {
					actorId: ACTOR_ID,
					integrationAppId: INTEGRATION_APP_ID,
					input,
					itemIndex: i,
					timeoutSecs: (timeout as number) || undefined,
				});
				const shape = OUTPUT_SHAPES[`${resource}:${operation}`];

				for (const result of shapeItems.call(this, results, shape, i)) {
					returnData.push({ json: result, pairedItem: { item: i } });
				}
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: { error: (error as Error).message },
						pairedItem: { item: i },
					});
					continue;
				}
				// Both constructors return an error of their own class unchanged.
				if (error instanceof NodeApiError) {
					throw new NodeApiError(this.getNode(), error as unknown as JsonObject, { itemIndex: i });
				}
				throw new NodeOperationError(this.getNode(), error as Error, { itemIndex: i });
			}
		}

		return [returnData];
	}
}
