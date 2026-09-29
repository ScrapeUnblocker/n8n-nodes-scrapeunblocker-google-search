import { GoogleSearchScraper } from './nodes/GoogleSearchScraper/GoogleSearchScraper.node';
import { ApifyApi } from './credentials/ApifyApi.credentials';

export const nodeTypes = [GoogleSearchScraper];

export const credentialTypes = [ApifyApi];
