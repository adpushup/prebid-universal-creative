const base64 = require('base-64');
const fs = require('fs');
const axios = require('axios');
const path = require('path');

const filePath = 'amp-hybrid/creative.js';
const sourceFilePath = path.join(__dirname, "../dist/creative.js");

const QUEUE_PUBLISHER_SERVICE_URL = 'http://queuepublisher.adpushup.com';

const uploadToCdn = (data) => {
	const body = {
		queue: 'CDN_ORIGIN',
		data
	};

	const uri = Array.isArray(data)
		? `${QUEUE_PUBLISHER_SERVICE_URL}/publishBulk`
		: `${QUEUE_PUBLISHER_SERVICE_URL}/publish`;

	const config = {
		method: 'post',
		url: uri,
		data: body
	};

	return axios(config)
		.then((response) => response.data)
		.catch((e) => {
			console.log(`error CDN upload:${e}`);
			throw e;
		});
};

const content = fs.readFileSync(sourceFilePath);

uploadToCdn([
	{
		filePath,
		content: base64.encode(unescape(encodeURIComponent(content)))
	}
])
	.then((d) => console.log('Uploaded Success', d))
	.catch((e) => console.log('Failed'));