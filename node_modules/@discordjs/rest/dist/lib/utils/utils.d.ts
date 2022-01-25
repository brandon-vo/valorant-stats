import type { Response } from 'node-fetch';
/**
 * Converts the response to usable data
 * @param res The node-fetch response
 */
export declare function parseResponse(res: Response): Promise<unknown>;
/**
 * Check whether a request falls under a sublimit
 * @param bucketRoute The buckets route identifier
 * @param body The options provided as JSON data
 * @param method The HTTP method that will be used to make the request
 * @returns Whether the request falls under a sublimit
 */
export declare function hasSublimit(bucketRoute: string, body?: unknown, method?: string): boolean;
