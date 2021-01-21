/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/axios/index.js":
/*!*************************************!*\
  !*** ./node_modules/axios/index.js ***!
  \*************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__(/*! ./lib/axios */ "./node_modules/axios/lib/axios.js");

/***/ }),

/***/ "./node_modules/axios/lib/adapters/xhr.js":
/*!************************************************!*\
  !*** ./node_modules/axios/lib/adapters/xhr.js ***!
  \************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");
var settle = __webpack_require__(/*! ./../core/settle */ "./node_modules/axios/lib/core/settle.js");
var cookies = __webpack_require__(/*! ./../helpers/cookies */ "./node_modules/axios/lib/helpers/cookies.js");
var buildURL = __webpack_require__(/*! ./../helpers/buildURL */ "./node_modules/axios/lib/helpers/buildURL.js");
var buildFullPath = __webpack_require__(/*! ../core/buildFullPath */ "./node_modules/axios/lib/core/buildFullPath.js");
var parseHeaders = __webpack_require__(/*! ./../helpers/parseHeaders */ "./node_modules/axios/lib/helpers/parseHeaders.js");
var isURLSameOrigin = __webpack_require__(/*! ./../helpers/isURLSameOrigin */ "./node_modules/axios/lib/helpers/isURLSameOrigin.js");
var createError = __webpack_require__(/*! ../core/createError */ "./node_modules/axios/lib/core/createError.js");

module.exports = function xhrAdapter(config) {
  return new Promise(function dispatchXhrRequest(resolve, reject) {
    var requestData = config.data;
    var requestHeaders = config.headers;

    if (utils.isFormData(requestData)) {
      delete requestHeaders['Content-Type']; // Let the browser set it
    }

    if (
      (utils.isBlob(requestData) || utils.isFile(requestData)) &&
      requestData.type
    ) {
      delete requestHeaders['Content-Type']; // Let the browser set it
    }

    var request = new XMLHttpRequest();

    // HTTP basic authentication
    if (config.auth) {
      var username = config.auth.username || '';
      var password = unescape(encodeURIComponent(config.auth.password)) || '';
      requestHeaders.Authorization = 'Basic ' + btoa(username + ':' + password);
    }

    var fullPath = buildFullPath(config.baseURL, config.url);
    request.open(config.method.toUpperCase(), buildURL(fullPath, config.params, config.paramsSerializer), true);

    // Set the request timeout in MS
    request.timeout = config.timeout;

    // Listen for ready state
    request.onreadystatechange = function handleLoad() {
      if (!request || request.readyState !== 4) {
        return;
      }

      // The request errored out and we didn't get a response, this will be
      // handled by onerror instead
      // With one exception: request that using file: protocol, most browsers
      // will return status as 0 even though it's a successful request
      if (request.status === 0 && !(request.responseURL && request.responseURL.indexOf('file:') === 0)) {
        return;
      }

      // Prepare the response
      var responseHeaders = 'getAllResponseHeaders' in request ? parseHeaders(request.getAllResponseHeaders()) : null;
      var responseData = !config.responseType || config.responseType === 'text' ? request.responseText : request.response;
      var response = {
        data: responseData,
        status: request.status,
        statusText: request.statusText,
        headers: responseHeaders,
        config: config,
        request: request
      };

      settle(resolve, reject, response);

      // Clean up request
      request = null;
    };

    // Handle browser request cancellation (as opposed to a manual cancellation)
    request.onabort = function handleAbort() {
      if (!request) {
        return;
      }

      reject(createError('Request aborted', config, 'ECONNABORTED', request));

      // Clean up request
      request = null;
    };

    // Handle low level network errors
    request.onerror = function handleError() {
      // Real errors are hidden from us by the browser
      // onerror should only fire if it's a network error
      reject(createError('Network Error', config, null, request));

      // Clean up request
      request = null;
    };

    // Handle timeout
    request.ontimeout = function handleTimeout() {
      var timeoutErrorMessage = 'timeout of ' + config.timeout + 'ms exceeded';
      if (config.timeoutErrorMessage) {
        timeoutErrorMessage = config.timeoutErrorMessage;
      }
      reject(createError(timeoutErrorMessage, config, 'ECONNABORTED',
        request));

      // Clean up request
      request = null;
    };

    // Add xsrf header
    // This is only done if running in a standard browser environment.
    // Specifically not if we're in a web worker, or react-native.
    if (utils.isStandardBrowserEnv()) {
      // Add xsrf header
      var xsrfValue = (config.withCredentials || isURLSameOrigin(fullPath)) && config.xsrfCookieName ?
        cookies.read(config.xsrfCookieName) :
        undefined;

      if (xsrfValue) {
        requestHeaders[config.xsrfHeaderName] = xsrfValue;
      }
    }

    // Add headers to the request
    if ('setRequestHeader' in request) {
      utils.forEach(requestHeaders, function setRequestHeader(val, key) {
        if (typeof requestData === 'undefined' && key.toLowerCase() === 'content-type') {
          // Remove Content-Type if data is undefined
          delete requestHeaders[key];
        } else {
          // Otherwise add header to the request
          request.setRequestHeader(key, val);
        }
      });
    }

    // Add withCredentials to request if needed
    if (!utils.isUndefined(config.withCredentials)) {
      request.withCredentials = !!config.withCredentials;
    }

    // Add responseType to request if needed
    if (config.responseType) {
      try {
        request.responseType = config.responseType;
      } catch (e) {
        // Expected DOMException thrown by browsers not compatible XMLHttpRequest Level 2.
        // But, this can be suppressed for 'json' type as it can be parsed by default 'transformResponse' function.
        if (config.responseType !== 'json') {
          throw e;
        }
      }
    }

    // Handle progress if needed
    if (typeof config.onDownloadProgress === 'function') {
      request.addEventListener('progress', config.onDownloadProgress);
    }

    // Not all browsers support upload events
    if (typeof config.onUploadProgress === 'function' && request.upload) {
      request.upload.addEventListener('progress', config.onUploadProgress);
    }

    if (config.cancelToken) {
      // Handle cancellation
      config.cancelToken.promise.then(function onCanceled(cancel) {
        if (!request) {
          return;
        }

        request.abort();
        reject(cancel);
        // Clean up request
        request = null;
      });
    }

    if (!requestData) {
      requestData = null;
    }

    // Send the request
    request.send(requestData);
  });
};


/***/ }),

/***/ "./node_modules/axios/lib/axios.js":
/*!*****************************************!*\
  !*** ./node_modules/axios/lib/axios.js ***!
  \*****************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./utils */ "./node_modules/axios/lib/utils.js");
var bind = __webpack_require__(/*! ./helpers/bind */ "./node_modules/axios/lib/helpers/bind.js");
var Axios = __webpack_require__(/*! ./core/Axios */ "./node_modules/axios/lib/core/Axios.js");
var mergeConfig = __webpack_require__(/*! ./core/mergeConfig */ "./node_modules/axios/lib/core/mergeConfig.js");
var defaults = __webpack_require__(/*! ./defaults */ "./node_modules/axios/lib/defaults.js");

/**
 * Create an instance of Axios
 *
 * @param {Object} defaultConfig The default config for the instance
 * @return {Axios} A new instance of Axios
 */
function createInstance(defaultConfig) {
  var context = new Axios(defaultConfig);
  var instance = bind(Axios.prototype.request, context);

  // Copy axios.prototype to instance
  utils.extend(instance, Axios.prototype, context);

  // Copy context to instance
  utils.extend(instance, context);

  return instance;
}

// Create the default instance to be exported
var axios = createInstance(defaults);

// Expose Axios class to allow class inheritance
axios.Axios = Axios;

// Factory for creating new instances
axios.create = function create(instanceConfig) {
  return createInstance(mergeConfig(axios.defaults, instanceConfig));
};

// Expose Cancel & CancelToken
axios.Cancel = __webpack_require__(/*! ./cancel/Cancel */ "./node_modules/axios/lib/cancel/Cancel.js");
axios.CancelToken = __webpack_require__(/*! ./cancel/CancelToken */ "./node_modules/axios/lib/cancel/CancelToken.js");
axios.isCancel = __webpack_require__(/*! ./cancel/isCancel */ "./node_modules/axios/lib/cancel/isCancel.js");

// Expose all/spread
axios.all = function all(promises) {
  return Promise.all(promises);
};
axios.spread = __webpack_require__(/*! ./helpers/spread */ "./node_modules/axios/lib/helpers/spread.js");

module.exports = axios;

// Allow use of default import syntax in TypeScript
module.exports.default = axios;


/***/ }),

/***/ "./node_modules/axios/lib/cancel/Cancel.js":
/*!*************************************************!*\
  !*** ./node_modules/axios/lib/cancel/Cancel.js ***!
  \*************************************************/
/***/ ((module) => {

"use strict";


/**
 * A `Cancel` is an object that is thrown when an operation is canceled.
 *
 * @class
 * @param {string=} message The message.
 */
function Cancel(message) {
  this.message = message;
}

Cancel.prototype.toString = function toString() {
  return 'Cancel' + (this.message ? ': ' + this.message : '');
};

Cancel.prototype.__CANCEL__ = true;

module.exports = Cancel;


/***/ }),

/***/ "./node_modules/axios/lib/cancel/CancelToken.js":
/*!******************************************************!*\
  !*** ./node_modules/axios/lib/cancel/CancelToken.js ***!
  \******************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var Cancel = __webpack_require__(/*! ./Cancel */ "./node_modules/axios/lib/cancel/Cancel.js");

/**
 * A `CancelToken` is an object that can be used to request cancellation of an operation.
 *
 * @class
 * @param {Function} executor The executor function.
 */
function CancelToken(executor) {
  if (typeof executor !== 'function') {
    throw new TypeError('executor must be a function.');
  }

  var resolvePromise;
  this.promise = new Promise(function promiseExecutor(resolve) {
    resolvePromise = resolve;
  });

  var token = this;
  executor(function cancel(message) {
    if (token.reason) {
      // Cancellation has already been requested
      return;
    }

    token.reason = new Cancel(message);
    resolvePromise(token.reason);
  });
}

/**
 * Throws a `Cancel` if cancellation has been requested.
 */
CancelToken.prototype.throwIfRequested = function throwIfRequested() {
  if (this.reason) {
    throw this.reason;
  }
};

/**
 * Returns an object that contains a new `CancelToken` and a function that, when called,
 * cancels the `CancelToken`.
 */
CancelToken.source = function source() {
  var cancel;
  var token = new CancelToken(function executor(c) {
    cancel = c;
  });
  return {
    token: token,
    cancel: cancel
  };
};

module.exports = CancelToken;


/***/ }),

/***/ "./node_modules/axios/lib/cancel/isCancel.js":
/*!***************************************************!*\
  !*** ./node_modules/axios/lib/cancel/isCancel.js ***!
  \***************************************************/
/***/ ((module) => {

"use strict";


module.exports = function isCancel(value) {
  return !!(value && value.__CANCEL__);
};


/***/ }),

/***/ "./node_modules/axios/lib/core/Axios.js":
/*!**********************************************!*\
  !*** ./node_modules/axios/lib/core/Axios.js ***!
  \**********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");
var buildURL = __webpack_require__(/*! ../helpers/buildURL */ "./node_modules/axios/lib/helpers/buildURL.js");
var InterceptorManager = __webpack_require__(/*! ./InterceptorManager */ "./node_modules/axios/lib/core/InterceptorManager.js");
var dispatchRequest = __webpack_require__(/*! ./dispatchRequest */ "./node_modules/axios/lib/core/dispatchRequest.js");
var mergeConfig = __webpack_require__(/*! ./mergeConfig */ "./node_modules/axios/lib/core/mergeConfig.js");

/**
 * Create a new instance of Axios
 *
 * @param {Object} instanceConfig The default config for the instance
 */
function Axios(instanceConfig) {
  this.defaults = instanceConfig;
  this.interceptors = {
    request: new InterceptorManager(),
    response: new InterceptorManager()
  };
}

/**
 * Dispatch a request
 *
 * @param {Object} config The config specific for this request (merged with this.defaults)
 */
Axios.prototype.request = function request(config) {
  /*eslint no-param-reassign:0*/
  // Allow for axios('example/url'[, config]) a la fetch API
  if (typeof config === 'string') {
    config = arguments[1] || {};
    config.url = arguments[0];
  } else {
    config = config || {};
  }

  config = mergeConfig(this.defaults, config);

  // Set config.method
  if (config.method) {
    config.method = config.method.toLowerCase();
  } else if (this.defaults.method) {
    config.method = this.defaults.method.toLowerCase();
  } else {
    config.method = 'get';
  }

  // Hook up interceptors middleware
  var chain = [dispatchRequest, undefined];
  var promise = Promise.resolve(config);

  this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
    chain.unshift(interceptor.fulfilled, interceptor.rejected);
  });

  this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
    chain.push(interceptor.fulfilled, interceptor.rejected);
  });

  while (chain.length) {
    promise = promise.then(chain.shift(), chain.shift());
  }

  return promise;
};

Axios.prototype.getUri = function getUri(config) {
  config = mergeConfig(this.defaults, config);
  return buildURL(config.url, config.params, config.paramsSerializer).replace(/^\?/, '');
};

// Provide aliases for supported request methods
utils.forEach(['delete', 'get', 'head', 'options'], function forEachMethodNoData(method) {
  /*eslint func-names:0*/
  Axios.prototype[method] = function(url, config) {
    return this.request(mergeConfig(config || {}, {
      method: method,
      url: url
    }));
  };
});

utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
  /*eslint func-names:0*/
  Axios.prototype[method] = function(url, data, config) {
    return this.request(mergeConfig(config || {}, {
      method: method,
      url: url,
      data: data
    }));
  };
});

module.exports = Axios;


/***/ }),

/***/ "./node_modules/axios/lib/core/InterceptorManager.js":
/*!***********************************************************!*\
  !*** ./node_modules/axios/lib/core/InterceptorManager.js ***!
  \***********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");

function InterceptorManager() {
  this.handlers = [];
}

/**
 * Add a new interceptor to the stack
 *
 * @param {Function} fulfilled The function to handle `then` for a `Promise`
 * @param {Function} rejected The function to handle `reject` for a `Promise`
 *
 * @return {Number} An ID used to remove interceptor later
 */
InterceptorManager.prototype.use = function use(fulfilled, rejected) {
  this.handlers.push({
    fulfilled: fulfilled,
    rejected: rejected
  });
  return this.handlers.length - 1;
};

/**
 * Remove an interceptor from the stack
 *
 * @param {Number} id The ID that was returned by `use`
 */
InterceptorManager.prototype.eject = function eject(id) {
  if (this.handlers[id]) {
    this.handlers[id] = null;
  }
};

/**
 * Iterate over all the registered interceptors
 *
 * This method is particularly useful for skipping over any
 * interceptors that may have become `null` calling `eject`.
 *
 * @param {Function} fn The function to call for each interceptor
 */
InterceptorManager.prototype.forEach = function forEach(fn) {
  utils.forEach(this.handlers, function forEachHandler(h) {
    if (h !== null) {
      fn(h);
    }
  });
};

module.exports = InterceptorManager;


/***/ }),

/***/ "./node_modules/axios/lib/core/buildFullPath.js":
/*!******************************************************!*\
  !*** ./node_modules/axios/lib/core/buildFullPath.js ***!
  \******************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var isAbsoluteURL = __webpack_require__(/*! ../helpers/isAbsoluteURL */ "./node_modules/axios/lib/helpers/isAbsoluteURL.js");
var combineURLs = __webpack_require__(/*! ../helpers/combineURLs */ "./node_modules/axios/lib/helpers/combineURLs.js");

/**
 * Creates a new URL by combining the baseURL with the requestedURL,
 * only when the requestedURL is not already an absolute URL.
 * If the requestURL is absolute, this function returns the requestedURL untouched.
 *
 * @param {string} baseURL The base URL
 * @param {string} requestedURL Absolute or relative URL to combine
 * @returns {string} The combined full path
 */
module.exports = function buildFullPath(baseURL, requestedURL) {
  if (baseURL && !isAbsoluteURL(requestedURL)) {
    return combineURLs(baseURL, requestedURL);
  }
  return requestedURL;
};


/***/ }),

/***/ "./node_modules/axios/lib/core/createError.js":
/*!****************************************************!*\
  !*** ./node_modules/axios/lib/core/createError.js ***!
  \****************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var enhanceError = __webpack_require__(/*! ./enhanceError */ "./node_modules/axios/lib/core/enhanceError.js");

/**
 * Create an Error with the specified message, config, error code, request and response.
 *
 * @param {string} message The error message.
 * @param {Object} config The config.
 * @param {string} [code] The error code (for example, 'ECONNABORTED').
 * @param {Object} [request] The request.
 * @param {Object} [response] The response.
 * @returns {Error} The created error.
 */
module.exports = function createError(message, config, code, request, response) {
  var error = new Error(message);
  return enhanceError(error, config, code, request, response);
};


/***/ }),

/***/ "./node_modules/axios/lib/core/dispatchRequest.js":
/*!********************************************************!*\
  !*** ./node_modules/axios/lib/core/dispatchRequest.js ***!
  \********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");
var transformData = __webpack_require__(/*! ./transformData */ "./node_modules/axios/lib/core/transformData.js");
var isCancel = __webpack_require__(/*! ../cancel/isCancel */ "./node_modules/axios/lib/cancel/isCancel.js");
var defaults = __webpack_require__(/*! ../defaults */ "./node_modules/axios/lib/defaults.js");

/**
 * Throws a `Cancel` if cancellation has been requested.
 */
function throwIfCancellationRequested(config) {
  if (config.cancelToken) {
    config.cancelToken.throwIfRequested();
  }
}

/**
 * Dispatch a request to the server using the configured adapter.
 *
 * @param {object} config The config that is to be used for the request
 * @returns {Promise} The Promise to be fulfilled
 */
module.exports = function dispatchRequest(config) {
  throwIfCancellationRequested(config);

  // Ensure headers exist
  config.headers = config.headers || {};

  // Transform request data
  config.data = transformData(
    config.data,
    config.headers,
    config.transformRequest
  );

  // Flatten headers
  config.headers = utils.merge(
    config.headers.common || {},
    config.headers[config.method] || {},
    config.headers
  );

  utils.forEach(
    ['delete', 'get', 'head', 'post', 'put', 'patch', 'common'],
    function cleanHeaderConfig(method) {
      delete config.headers[method];
    }
  );

  var adapter = config.adapter || defaults.adapter;

  return adapter(config).then(function onAdapterResolution(response) {
    throwIfCancellationRequested(config);

    // Transform response data
    response.data = transformData(
      response.data,
      response.headers,
      config.transformResponse
    );

    return response;
  }, function onAdapterRejection(reason) {
    if (!isCancel(reason)) {
      throwIfCancellationRequested(config);

      // Transform response data
      if (reason && reason.response) {
        reason.response.data = transformData(
          reason.response.data,
          reason.response.headers,
          config.transformResponse
        );
      }
    }

    return Promise.reject(reason);
  });
};


/***/ }),

/***/ "./node_modules/axios/lib/core/enhanceError.js":
/*!*****************************************************!*\
  !*** ./node_modules/axios/lib/core/enhanceError.js ***!
  \*****************************************************/
/***/ ((module) => {

"use strict";


/**
 * Update an Error with the specified config, error code, and response.
 *
 * @param {Error} error The error to update.
 * @param {Object} config The config.
 * @param {string} [code] The error code (for example, 'ECONNABORTED').
 * @param {Object} [request] The request.
 * @param {Object} [response] The response.
 * @returns {Error} The error.
 */
module.exports = function enhanceError(error, config, code, request, response) {
  error.config = config;
  if (code) {
    error.code = code;
  }

  error.request = request;
  error.response = response;
  error.isAxiosError = true;

  error.toJSON = function toJSON() {
    return {
      // Standard
      message: this.message,
      name: this.name,
      // Microsoft
      description: this.description,
      number: this.number,
      // Mozilla
      fileName: this.fileName,
      lineNumber: this.lineNumber,
      columnNumber: this.columnNumber,
      stack: this.stack,
      // Axios
      config: this.config,
      code: this.code
    };
  };
  return error;
};


/***/ }),

/***/ "./node_modules/axios/lib/core/mergeConfig.js":
/*!****************************************************!*\
  !*** ./node_modules/axios/lib/core/mergeConfig.js ***!
  \****************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ../utils */ "./node_modules/axios/lib/utils.js");

/**
 * Config-specific merge-function which creates a new config-object
 * by merging two configuration objects together.
 *
 * @param {Object} config1
 * @param {Object} config2
 * @returns {Object} New object resulting from merging config2 to config1
 */
module.exports = function mergeConfig(config1, config2) {
  // eslint-disable-next-line no-param-reassign
  config2 = config2 || {};
  var config = {};

  var valueFromConfig2Keys = ['url', 'method', 'data'];
  var mergeDeepPropertiesKeys = ['headers', 'auth', 'proxy', 'params'];
  var defaultToConfig2Keys = [
    'baseURL', 'transformRequest', 'transformResponse', 'paramsSerializer',
    'timeout', 'timeoutMessage', 'withCredentials', 'adapter', 'responseType', 'xsrfCookieName',
    'xsrfHeaderName', 'onUploadProgress', 'onDownloadProgress', 'decompress',
    'maxContentLength', 'maxBodyLength', 'maxRedirects', 'transport', 'httpAgent',
    'httpsAgent', 'cancelToken', 'socketPath', 'responseEncoding'
  ];
  var directMergeKeys = ['validateStatus'];

  function getMergedValue(target, source) {
    if (utils.isPlainObject(target) && utils.isPlainObject(source)) {
      return utils.merge(target, source);
    } else if (utils.isPlainObject(source)) {
      return utils.merge({}, source);
    } else if (utils.isArray(source)) {
      return source.slice();
    }
    return source;
  }

  function mergeDeepProperties(prop) {
    if (!utils.isUndefined(config2[prop])) {
      config[prop] = getMergedValue(config1[prop], config2[prop]);
    } else if (!utils.isUndefined(config1[prop])) {
      config[prop] = getMergedValue(undefined, config1[prop]);
    }
  }

  utils.forEach(valueFromConfig2Keys, function valueFromConfig2(prop) {
    if (!utils.isUndefined(config2[prop])) {
      config[prop] = getMergedValue(undefined, config2[prop]);
    }
  });

  utils.forEach(mergeDeepPropertiesKeys, mergeDeepProperties);

  utils.forEach(defaultToConfig2Keys, function defaultToConfig2(prop) {
    if (!utils.isUndefined(config2[prop])) {
      config[prop] = getMergedValue(undefined, config2[prop]);
    } else if (!utils.isUndefined(config1[prop])) {
      config[prop] = getMergedValue(undefined, config1[prop]);
    }
  });

  utils.forEach(directMergeKeys, function merge(prop) {
    if (prop in config2) {
      config[prop] = getMergedValue(config1[prop], config2[prop]);
    } else if (prop in config1) {
      config[prop] = getMergedValue(undefined, config1[prop]);
    }
  });

  var axiosKeys = valueFromConfig2Keys
    .concat(mergeDeepPropertiesKeys)
    .concat(defaultToConfig2Keys)
    .concat(directMergeKeys);

  var otherKeys = Object
    .keys(config1)
    .concat(Object.keys(config2))
    .filter(function filterAxiosKeys(key) {
      return axiosKeys.indexOf(key) === -1;
    });

  utils.forEach(otherKeys, mergeDeepProperties);

  return config;
};


/***/ }),

/***/ "./node_modules/axios/lib/core/settle.js":
/*!***********************************************!*\
  !*** ./node_modules/axios/lib/core/settle.js ***!
  \***********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var createError = __webpack_require__(/*! ./createError */ "./node_modules/axios/lib/core/createError.js");

/**
 * Resolve or reject a Promise based on response status.
 *
 * @param {Function} resolve A function that resolves the promise.
 * @param {Function} reject A function that rejects the promise.
 * @param {object} response The response.
 */
module.exports = function settle(resolve, reject, response) {
  var validateStatus = response.config.validateStatus;
  if (!response.status || !validateStatus || validateStatus(response.status)) {
    resolve(response);
  } else {
    reject(createError(
      'Request failed with status code ' + response.status,
      response.config,
      null,
      response.request,
      response
    ));
  }
};


/***/ }),

/***/ "./node_modules/axios/lib/core/transformData.js":
/*!******************************************************!*\
  !*** ./node_modules/axios/lib/core/transformData.js ***!
  \******************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");

/**
 * Transform the data for a request or a response
 *
 * @param {Object|String} data The data to be transformed
 * @param {Array} headers The headers for the request or response
 * @param {Array|Function} fns A single function or Array of functions
 * @returns {*} The resulting transformed data
 */
module.exports = function transformData(data, headers, fns) {
  /*eslint no-param-reassign:0*/
  utils.forEach(fns, function transform(fn) {
    data = fn(data, headers);
  });

  return data;
};


/***/ }),

/***/ "./node_modules/axios/lib/defaults.js":
/*!********************************************!*\
  !*** ./node_modules/axios/lib/defaults.js ***!
  \********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./utils */ "./node_modules/axios/lib/utils.js");
var normalizeHeaderName = __webpack_require__(/*! ./helpers/normalizeHeaderName */ "./node_modules/axios/lib/helpers/normalizeHeaderName.js");

var DEFAULT_CONTENT_TYPE = {
  'Content-Type': 'application/x-www-form-urlencoded'
};

function setContentTypeIfUnset(headers, value) {
  if (!utils.isUndefined(headers) && utils.isUndefined(headers['Content-Type'])) {
    headers['Content-Type'] = value;
  }
}

function getDefaultAdapter() {
  var adapter;
  if (typeof XMLHttpRequest !== 'undefined') {
    // For browsers use XHR adapter
    adapter = __webpack_require__(/*! ./adapters/xhr */ "./node_modules/axios/lib/adapters/xhr.js");
  } else if (typeof process !== 'undefined' && Object.prototype.toString.call(process) === '[object process]') {
    // For node use HTTP adapter
    adapter = __webpack_require__(/*! ./adapters/http */ "./node_modules/axios/lib/adapters/xhr.js");
  }
  return adapter;
}

var defaults = {
  adapter: getDefaultAdapter(),

  transformRequest: [function transformRequest(data, headers) {
    normalizeHeaderName(headers, 'Accept');
    normalizeHeaderName(headers, 'Content-Type');
    if (utils.isFormData(data) ||
      utils.isArrayBuffer(data) ||
      utils.isBuffer(data) ||
      utils.isStream(data) ||
      utils.isFile(data) ||
      utils.isBlob(data)
    ) {
      return data;
    }
    if (utils.isArrayBufferView(data)) {
      return data.buffer;
    }
    if (utils.isURLSearchParams(data)) {
      setContentTypeIfUnset(headers, 'application/x-www-form-urlencoded;charset=utf-8');
      return data.toString();
    }
    if (utils.isObject(data)) {
      setContentTypeIfUnset(headers, 'application/json;charset=utf-8');
      return JSON.stringify(data);
    }
    return data;
  }],

  transformResponse: [function transformResponse(data) {
    /*eslint no-param-reassign:0*/
    if (typeof data === 'string') {
      try {
        data = JSON.parse(data);
      } catch (e) { /* Ignore */ }
    }
    return data;
  }],

  /**
   * A timeout in milliseconds to abort a request. If set to 0 (default) a
   * timeout is not created.
   */
  timeout: 0,

  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',

  maxContentLength: -1,
  maxBodyLength: -1,

  validateStatus: function validateStatus(status) {
    return status >= 200 && status < 300;
  }
};

defaults.headers = {
  common: {
    'Accept': 'application/json, text/plain, */*'
  }
};

utils.forEach(['delete', 'get', 'head'], function forEachMethodNoData(method) {
  defaults.headers[method] = {};
});

utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
  defaults.headers[method] = utils.merge(DEFAULT_CONTENT_TYPE);
});

module.exports = defaults;


/***/ }),

/***/ "./node_modules/axios/lib/helpers/bind.js":
/*!************************************************!*\
  !*** ./node_modules/axios/lib/helpers/bind.js ***!
  \************************************************/
/***/ ((module) => {

"use strict";


module.exports = function bind(fn, thisArg) {
  return function wrap() {
    var args = new Array(arguments.length);
    for (var i = 0; i < args.length; i++) {
      args[i] = arguments[i];
    }
    return fn.apply(thisArg, args);
  };
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/buildURL.js":
/*!****************************************************!*\
  !*** ./node_modules/axios/lib/helpers/buildURL.js ***!
  \****************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");

function encode(val) {
  return encodeURIComponent(val).
    replace(/%3A/gi, ':').
    replace(/%24/g, '$').
    replace(/%2C/gi, ',').
    replace(/%20/g, '+').
    replace(/%5B/gi, '[').
    replace(/%5D/gi, ']');
}

/**
 * Build a URL by appending params to the end
 *
 * @param {string} url The base of the url (e.g., http://www.google.com)
 * @param {object} [params] The params to be appended
 * @returns {string} The formatted url
 */
module.exports = function buildURL(url, params, paramsSerializer) {
  /*eslint no-param-reassign:0*/
  if (!params) {
    return url;
  }

  var serializedParams;
  if (paramsSerializer) {
    serializedParams = paramsSerializer(params);
  } else if (utils.isURLSearchParams(params)) {
    serializedParams = params.toString();
  } else {
    var parts = [];

    utils.forEach(params, function serialize(val, key) {
      if (val === null || typeof val === 'undefined') {
        return;
      }

      if (utils.isArray(val)) {
        key = key + '[]';
      } else {
        val = [val];
      }

      utils.forEach(val, function parseValue(v) {
        if (utils.isDate(v)) {
          v = v.toISOString();
        } else if (utils.isObject(v)) {
          v = JSON.stringify(v);
        }
        parts.push(encode(key) + '=' + encode(v));
      });
    });

    serializedParams = parts.join('&');
  }

  if (serializedParams) {
    var hashmarkIndex = url.indexOf('#');
    if (hashmarkIndex !== -1) {
      url = url.slice(0, hashmarkIndex);
    }

    url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams;
  }

  return url;
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/combineURLs.js":
/*!*******************************************************!*\
  !*** ./node_modules/axios/lib/helpers/combineURLs.js ***!
  \*******************************************************/
/***/ ((module) => {

"use strict";


/**
 * Creates a new URL by combining the specified URLs
 *
 * @param {string} baseURL The base URL
 * @param {string} relativeURL The relative URL
 * @returns {string} The combined URL
 */
module.exports = function combineURLs(baseURL, relativeURL) {
  return relativeURL
    ? baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '')
    : baseURL;
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/cookies.js":
/*!***************************************************!*\
  !*** ./node_modules/axios/lib/helpers/cookies.js ***!
  \***************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");

module.exports = (
  utils.isStandardBrowserEnv() ?

  // Standard browser envs support document.cookie
    (function standardBrowserEnv() {
      return {
        write: function write(name, value, expires, path, domain, secure) {
          var cookie = [];
          cookie.push(name + '=' + encodeURIComponent(value));

          if (utils.isNumber(expires)) {
            cookie.push('expires=' + new Date(expires).toGMTString());
          }

          if (utils.isString(path)) {
            cookie.push('path=' + path);
          }

          if (utils.isString(domain)) {
            cookie.push('domain=' + domain);
          }

          if (secure === true) {
            cookie.push('secure');
          }

          document.cookie = cookie.join('; ');
        },

        read: function read(name) {
          var match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
          return (match ? decodeURIComponent(match[3]) : null);
        },

        remove: function remove(name) {
          this.write(name, '', Date.now() - 86400000);
        }
      };
    })() :

  // Non standard browser env (web workers, react-native) lack needed support.
    (function nonStandardBrowserEnv() {
      return {
        write: function write() {},
        read: function read() { return null; },
        remove: function remove() {}
      };
    })()
);


/***/ }),

/***/ "./node_modules/axios/lib/helpers/isAbsoluteURL.js":
/*!*********************************************************!*\
  !*** ./node_modules/axios/lib/helpers/isAbsoluteURL.js ***!
  \*********************************************************/
/***/ ((module) => {

"use strict";


/**
 * Determines whether the specified URL is absolute
 *
 * @param {string} url The URL to test
 * @returns {boolean} True if the specified URL is absolute, otherwise false
 */
module.exports = function isAbsoluteURL(url) {
  // A URL is considered absolute if it begins with "<scheme>://" or "//" (protocol-relative URL).
  // RFC 3986 defines scheme name as a sequence of characters beginning with a letter and followed
  // by any combination of letters, digits, plus, period, or hyphen.
  return /^([a-z][a-z\d\+\-\.]*:)?\/\//i.test(url);
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/isURLSameOrigin.js":
/*!***********************************************************!*\
  !*** ./node_modules/axios/lib/helpers/isURLSameOrigin.js ***!
  \***********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");

module.exports = (
  utils.isStandardBrowserEnv() ?

  // Standard browser envs have full support of the APIs needed to test
  // whether the request URL is of the same origin as current location.
    (function standardBrowserEnv() {
      var msie = /(msie|trident)/i.test(navigator.userAgent);
      var urlParsingNode = document.createElement('a');
      var originURL;

      /**
    * Parse a URL to discover it's components
    *
    * @param {String} url The URL to be parsed
    * @returns {Object}
    */
      function resolveURL(url) {
        var href = url;

        if (msie) {
        // IE needs attribute set twice to normalize properties
          urlParsingNode.setAttribute('href', href);
          href = urlParsingNode.href;
        }

        urlParsingNode.setAttribute('href', href);

        // urlParsingNode provides the UrlUtils interface - http://url.spec.whatwg.org/#urlutils
        return {
          href: urlParsingNode.href,
          protocol: urlParsingNode.protocol ? urlParsingNode.protocol.replace(/:$/, '') : '',
          host: urlParsingNode.host,
          search: urlParsingNode.search ? urlParsingNode.search.replace(/^\?/, '') : '',
          hash: urlParsingNode.hash ? urlParsingNode.hash.replace(/^#/, '') : '',
          hostname: urlParsingNode.hostname,
          port: urlParsingNode.port,
          pathname: (urlParsingNode.pathname.charAt(0) === '/') ?
            urlParsingNode.pathname :
            '/' + urlParsingNode.pathname
        };
      }

      originURL = resolveURL(window.location.href);

      /**
    * Determine if a URL shares the same origin as the current location
    *
    * @param {String} requestURL The URL to test
    * @returns {boolean} True if URL shares the same origin, otherwise false
    */
      return function isURLSameOrigin(requestURL) {
        var parsed = (utils.isString(requestURL)) ? resolveURL(requestURL) : requestURL;
        return (parsed.protocol === originURL.protocol &&
            parsed.host === originURL.host);
      };
    })() :

  // Non standard browser envs (web workers, react-native) lack needed support.
    (function nonStandardBrowserEnv() {
      return function isURLSameOrigin() {
        return true;
      };
    })()
);


/***/ }),

/***/ "./node_modules/axios/lib/helpers/normalizeHeaderName.js":
/*!***************************************************************!*\
  !*** ./node_modules/axios/lib/helpers/normalizeHeaderName.js ***!
  \***************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ../utils */ "./node_modules/axios/lib/utils.js");

module.exports = function normalizeHeaderName(headers, normalizedName) {
  utils.forEach(headers, function processHeader(value, name) {
    if (name !== normalizedName && name.toUpperCase() === normalizedName.toUpperCase()) {
      headers[normalizedName] = value;
      delete headers[name];
    }
  });
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/parseHeaders.js":
/*!********************************************************!*\
  !*** ./node_modules/axios/lib/helpers/parseHeaders.js ***!
  \********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");

// Headers whose duplicates are ignored by node
// c.f. https://nodejs.org/api/http.html#http_message_headers
var ignoreDuplicateOf = [
  'age', 'authorization', 'content-length', 'content-type', 'etag',
  'expires', 'from', 'host', 'if-modified-since', 'if-unmodified-since',
  'last-modified', 'location', 'max-forwards', 'proxy-authorization',
  'referer', 'retry-after', 'user-agent'
];

/**
 * Parse headers into an object
 *
 * ```
 * Date: Wed, 27 Aug 2014 08:58:49 GMT
 * Content-Type: application/json
 * Connection: keep-alive
 * Transfer-Encoding: chunked
 * ```
 *
 * @param {String} headers Headers needing to be parsed
 * @returns {Object} Headers parsed into an object
 */
module.exports = function parseHeaders(headers) {
  var parsed = {};
  var key;
  var val;
  var i;

  if (!headers) { return parsed; }

  utils.forEach(headers.split('\n'), function parser(line) {
    i = line.indexOf(':');
    key = utils.trim(line.substr(0, i)).toLowerCase();
    val = utils.trim(line.substr(i + 1));

    if (key) {
      if (parsed[key] && ignoreDuplicateOf.indexOf(key) >= 0) {
        return;
      }
      if (key === 'set-cookie') {
        parsed[key] = (parsed[key] ? parsed[key] : []).concat([val]);
      } else {
        parsed[key] = parsed[key] ? parsed[key] + ', ' + val : val;
      }
    }
  });

  return parsed;
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/spread.js":
/*!**************************************************!*\
  !*** ./node_modules/axios/lib/helpers/spread.js ***!
  \**************************************************/
/***/ ((module) => {

"use strict";


/**
 * Syntactic sugar for invoking a function and expanding an array for arguments.
 *
 * Common use case would be to use `Function.prototype.apply`.
 *
 *  ```js
 *  function f(x, y, z) {}
 *  var args = [1, 2, 3];
 *  f.apply(null, args);
 *  ```
 *
 * With `spread` this example can be re-written.
 *
 *  ```js
 *  spread(function(x, y, z) {})([1, 2, 3]);
 *  ```
 *
 * @param {Function} callback
 * @returns {Function}
 */
module.exports = function spread(callback) {
  return function wrap(arr) {
    return callback.apply(null, arr);
  };
};


/***/ }),

/***/ "./node_modules/axios/lib/utils.js":
/*!*****************************************!*\
  !*** ./node_modules/axios/lib/utils.js ***!
  \*****************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var bind = __webpack_require__(/*! ./helpers/bind */ "./node_modules/axios/lib/helpers/bind.js");

/*global toString:true*/

// utils is a library of generic helper functions non-specific to axios

var toString = Object.prototype.toString;

/**
 * Determine if a value is an Array
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an Array, otherwise false
 */
function isArray(val) {
  return toString.call(val) === '[object Array]';
}

/**
 * Determine if a value is undefined
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if the value is undefined, otherwise false
 */
function isUndefined(val) {
  return typeof val === 'undefined';
}

/**
 * Determine if a value is a Buffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Buffer, otherwise false
 */
function isBuffer(val) {
  return val !== null && !isUndefined(val) && val.constructor !== null && !isUndefined(val.constructor)
    && typeof val.constructor.isBuffer === 'function' && val.constructor.isBuffer(val);
}

/**
 * Determine if a value is an ArrayBuffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an ArrayBuffer, otherwise false
 */
function isArrayBuffer(val) {
  return toString.call(val) === '[object ArrayBuffer]';
}

/**
 * Determine if a value is a FormData
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an FormData, otherwise false
 */
function isFormData(val) {
  return (typeof FormData !== 'undefined') && (val instanceof FormData);
}

/**
 * Determine if a value is a view on an ArrayBuffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a view on an ArrayBuffer, otherwise false
 */
function isArrayBufferView(val) {
  var result;
  if ((typeof ArrayBuffer !== 'undefined') && (ArrayBuffer.isView)) {
    result = ArrayBuffer.isView(val);
  } else {
    result = (val) && (val.buffer) && (val.buffer instanceof ArrayBuffer);
  }
  return result;
}

/**
 * Determine if a value is a String
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a String, otherwise false
 */
function isString(val) {
  return typeof val === 'string';
}

/**
 * Determine if a value is a Number
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Number, otherwise false
 */
function isNumber(val) {
  return typeof val === 'number';
}

/**
 * Determine if a value is an Object
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an Object, otherwise false
 */
function isObject(val) {
  return val !== null && typeof val === 'object';
}

/**
 * Determine if a value is a plain Object
 *
 * @param {Object} val The value to test
 * @return {boolean} True if value is a plain Object, otherwise false
 */
function isPlainObject(val) {
  if (toString.call(val) !== '[object Object]') {
    return false;
  }

  var prototype = Object.getPrototypeOf(val);
  return prototype === null || prototype === Object.prototype;
}

/**
 * Determine if a value is a Date
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Date, otherwise false
 */
function isDate(val) {
  return toString.call(val) === '[object Date]';
}

/**
 * Determine if a value is a File
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a File, otherwise false
 */
function isFile(val) {
  return toString.call(val) === '[object File]';
}

/**
 * Determine if a value is a Blob
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Blob, otherwise false
 */
function isBlob(val) {
  return toString.call(val) === '[object Blob]';
}

/**
 * Determine if a value is a Function
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Function, otherwise false
 */
function isFunction(val) {
  return toString.call(val) === '[object Function]';
}

/**
 * Determine if a value is a Stream
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Stream, otherwise false
 */
function isStream(val) {
  return isObject(val) && isFunction(val.pipe);
}

/**
 * Determine if a value is a URLSearchParams object
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a URLSearchParams object, otherwise false
 */
function isURLSearchParams(val) {
  return typeof URLSearchParams !== 'undefined' && val instanceof URLSearchParams;
}

/**
 * Trim excess whitespace off the beginning and end of a string
 *
 * @param {String} str The String to trim
 * @returns {String} The String freed of excess whitespace
 */
function trim(str) {
  return str.replace(/^\s*/, '').replace(/\s*$/, '');
}

/**
 * Determine if we're running in a standard browser environment
 *
 * This allows axios to run in a web worker, and react-native.
 * Both environments support XMLHttpRequest, but not fully standard globals.
 *
 * web workers:
 *  typeof window -> undefined
 *  typeof document -> undefined
 *
 * react-native:
 *  navigator.product -> 'ReactNative'
 * nativescript
 *  navigator.product -> 'NativeScript' or 'NS'
 */
function isStandardBrowserEnv() {
  if (typeof navigator !== 'undefined' && (navigator.product === 'ReactNative' ||
                                           navigator.product === 'NativeScript' ||
                                           navigator.product === 'NS')) {
    return false;
  }
  return (
    typeof window !== 'undefined' &&
    typeof document !== 'undefined'
  );
}

/**
 * Iterate over an Array or an Object invoking a function for each item.
 *
 * If `obj` is an Array callback will be called passing
 * the value, index, and complete array for each item.
 *
 * If 'obj' is an Object callback will be called passing
 * the value, key, and complete object for each property.
 *
 * @param {Object|Array} obj The object to iterate
 * @param {Function} fn The callback to invoke for each item
 */
function forEach(obj, fn) {
  // Don't bother if no value provided
  if (obj === null || typeof obj === 'undefined') {
    return;
  }

  // Force an array if not already something iterable
  if (typeof obj !== 'object') {
    /*eslint no-param-reassign:0*/
    obj = [obj];
  }

  if (isArray(obj)) {
    // Iterate over array values
    for (var i = 0, l = obj.length; i < l; i++) {
      fn.call(null, obj[i], i, obj);
    }
  } else {
    // Iterate over object keys
    for (var key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        fn.call(null, obj[key], key, obj);
      }
    }
  }
}

/**
 * Accepts varargs expecting each argument to be an object, then
 * immutably merges the properties of each object and returns result.
 *
 * When multiple objects contain the same key the later object in
 * the arguments list will take precedence.
 *
 * Example:
 *
 * ```js
 * var result = merge({foo: 123}, {foo: 456});
 * console.log(result.foo); // outputs 456
 * ```
 *
 * @param {Object} obj1 Object to merge
 * @returns {Object} Result of all merge properties
 */
function merge(/* obj1, obj2, obj3, ... */) {
  var result = {};
  function assignValue(val, key) {
    if (isPlainObject(result[key]) && isPlainObject(val)) {
      result[key] = merge(result[key], val);
    } else if (isPlainObject(val)) {
      result[key] = merge({}, val);
    } else if (isArray(val)) {
      result[key] = val.slice();
    } else {
      result[key] = val;
    }
  }

  for (var i = 0, l = arguments.length; i < l; i++) {
    forEach(arguments[i], assignValue);
  }
  return result;
}

/**
 * Extends object a by mutably adding to it the properties of object b.
 *
 * @param {Object} a The object to be extended
 * @param {Object} b The object to copy properties from
 * @param {Object} thisArg The object to bind function to
 * @return {Object} The resulting value of object a
 */
function extend(a, b, thisArg) {
  forEach(b, function assignValue(val, key) {
    if (thisArg && typeof val === 'function') {
      a[key] = bind(val, thisArg);
    } else {
      a[key] = val;
    }
  });
  return a;
}

/**
 * Remove byte order marker. This catches EF BB BF (the UTF-8 BOM)
 *
 * @param {string} content with BOM
 * @return {string} content value without BOM
 */
function stripBOM(content) {
  if (content.charCodeAt(0) === 0xFEFF) {
    content = content.slice(1);
  }
  return content;
}

module.exports = {
  isArray: isArray,
  isArrayBuffer: isArrayBuffer,
  isBuffer: isBuffer,
  isFormData: isFormData,
  isArrayBufferView: isArrayBufferView,
  isString: isString,
  isNumber: isNumber,
  isObject: isObject,
  isPlainObject: isPlainObject,
  isUndefined: isUndefined,
  isDate: isDate,
  isFile: isFile,
  isBlob: isBlob,
  isFunction: isFunction,
  isStream: isStream,
  isURLSearchParams: isURLSearchParams,
  isStandardBrowserEnv: isStandardBrowserEnv,
  forEach: forEach,
  merge: merge,
  extend: extend,
  trim: trim,
  stripBOM: stripBOM
};


/***/ }),

/***/ "./node_modules/css-loader/dist/cjs.js!./node_modules/sass-loader/dist/cjs.js!./resources/scss/scss.scss":
/*!***************************************************************************************************************!*\
  !*** ./node_modules/css-loader/dist/cjs.js!./node_modules/sass-loader/dist/cjs.js!./resources/scss/scss.scss ***!
  \***************************************************************************************************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => __WEBPACK_DEFAULT_EXPORT__
/* harmony export */ });
/* harmony import */ var _node_modules_css_loader_dist_runtime_cssWithMappingToString_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../node_modules/css-loader/dist/runtime/cssWithMappingToString.js */ "./node_modules/css-loader/dist/runtime/cssWithMappingToString.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_cssWithMappingToString_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_cssWithMappingToString_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../node_modules/css-loader/dist/runtime/api.js */ "./node_modules/css-loader/dist/runtime/api.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__);
// Imports


var ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default()((_node_modules_css_loader_dist_runtime_cssWithMappingToString_js__WEBPACK_IMPORTED_MODULE_0___default()));
// Module
___CSS_LOADER_EXPORT___.push([module.id, ".noty_layout_mixin, #noty_layout__centerRight, #noty_layout__centerLeft, #noty_layout__center, #noty_layout__bottomRight, #noty_layout__bottomCenter, #noty_layout__bottomLeft, #noty_layout__bottom, #noty_layout__topRight, #noty_layout__topCenter, #noty_layout__topLeft, #noty_layout__top {\n  position: fixed;\n  margin: 0;\n  padding: 0;\n  z-index: 9999999;\n  transform: translateZ(0) scale(1, 1);\n  backface-visibility: hidden;\n  -webkit-font-smoothing: subpixel-antialiased;\n  filter: blur(0);\n  -webkit-filter: blur(0);\n  max-width: 90%;\n}\n\n#noty_layout__top {\n  top: 0;\n  left: 5%;\n  width: 90%;\n}\n\n#noty_layout__topLeft {\n  top: 20px;\n  left: 20px;\n  width: 325px;\n}\n\n#noty_layout__topCenter {\n  top: 5%;\n  left: 50%;\n  width: 325px;\n  transform: translate(calc(-50% - .5px)) translateZ(0) scale(1, 1);\n}\n\n#noty_layout__topRight {\n  top: 20px;\n  right: 20px;\n  width: 325px;\n}\n\n#noty_layout__bottom {\n  bottom: 0;\n  left: 5%;\n  width: 90%;\n}\n\n#noty_layout__bottomLeft {\n  bottom: 20px;\n  left: 20px;\n  width: 325px;\n}\n\n#noty_layout__bottomCenter {\n  bottom: 5%;\n  left: 50%;\n  width: 325px;\n  transform: translate(calc(-50% - .5px)) translateZ(0) scale(1, 1);\n}\n\n#noty_layout__bottomRight {\n  bottom: 20px;\n  right: 20px;\n  width: 325px;\n}\n\n#noty_layout__center {\n  top: 50%;\n  left: 50%;\n  width: 325px;\n  transform: translate(calc(-50% - .5px), calc(-50% - .5px)) translateZ(0) scale(1, 1);\n}\n\n#noty_layout__centerLeft {\n  top: 50%;\n  left: 20px;\n  width: 325px;\n  transform: translate(0, calc(-50% - .5px)) translateZ(0) scale(1, 1);\n}\n\n#noty_layout__centerRight {\n  top: 50%;\n  right: 20px;\n  width: 325px;\n  transform: translate(0, calc(-50% - .5px)) translateZ(0) scale(1, 1);\n}\n\n.noty_progressbar {\n  display: none;\n}\n\n.noty_has_timeout.noty_has_progressbar .noty_progressbar {\n  display: block;\n  position: absolute;\n  left: 0;\n  bottom: 0;\n  height: 3px;\n  width: 100%;\n  background-color: #646464;\n  opacity: 0.2;\n  filter: alpha(opacity=10);\n}\n\n.noty_bar {\n  -webkit-backface-visibility: hidden;\n  -webkit-transform: translate(0, 0) translateZ(0) scale(1, 1);\n  transform: translate(0, 0) scale(1, 1);\n  -webkit-font-smoothing: subpixel-antialiased;\n  overflow: hidden;\n}\n\n.noty_effects_open {\n  opacity: 0;\n  transform: translate(50%);\n  animation: noty_anim_in 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);\n  animation-fill-mode: forwards;\n}\n\n.noty_effects_close {\n  animation: noty_anim_out 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);\n  animation-fill-mode: forwards;\n}\n\n.noty_fix_effects_height {\n  animation: noty_anim_height 75ms ease-out;\n}\n\n.noty_close_with_click {\n  cursor: pointer;\n}\n\n.noty_close_button {\n  position: absolute;\n  top: 2px;\n  right: 2px;\n  font-weight: bold;\n  width: 20px;\n  height: 20px;\n  text-align: center;\n  line-height: 20px;\n  background-color: rgba(0, 0, 0, 0.05);\n  border-radius: 2px;\n  cursor: pointer;\n  transition: all 0.2s ease-out;\n}\n\n.noty_close_button:hover {\n  background-color: rgba(0, 0, 0, 0.1);\n}\n\n.noty_modal {\n  position: fixed;\n  width: 100%;\n  height: 100%;\n  background-color: #000;\n  z-index: 10000;\n  opacity: 0.3;\n  left: 0;\n  top: 0;\n}\n\n.noty_modal.noty_modal_open {\n  opacity: 0;\n  animation: noty_modal_in 0.3s ease-out;\n}\n\n.noty_modal.noty_modal_close {\n  animation: noty_modal_out 0.3s ease-out;\n  animation-fill-mode: forwards;\n}\n\n@keyframes noty_modal_in {\n  100% {\n    opacity: 0.3;\n  }\n}\n@keyframes noty_modal_out {\n  100% {\n    opacity: 0;\n  }\n}\n@keyframes noty_modal_out {\n  100% {\n    opacity: 0;\n  }\n}\n@keyframes noty_anim_in {\n  100% {\n    transform: translate(0);\n    opacity: 1;\n  }\n}\n@keyframes noty_anim_out {\n  100% {\n    transform: translate(50%);\n    opacity: 0;\n  }\n}\n@keyframes noty_anim_height {\n  100% {\n    height: 0;\n  }\n}\n.noty_theme__mint.noty_bar {\n  margin: 4px 0;\n  overflow: hidden;\n  border-radius: 2px;\n  position: relative;\n}\n.noty_theme__mint.noty_bar .noty_body {\n  padding: 10px;\n  font-size: 14px;\n}\n.noty_theme__mint.noty_bar .noty_buttons {\n  padding: 10px;\n}\n\n.noty_theme__mint.noty_type__alert,\n.noty_theme__mint.noty_type__notification {\n  background-color: #fff;\n  border-bottom: 1px solid #D1D1D1;\n  color: #2F2F2F;\n}\n\n.noty_theme__mint.noty_type__warning {\n  background-color: #FFAE42;\n  border-bottom: 1px solid #E89F3C;\n  color: #fff;\n}\n\n.noty_theme__mint.noty_type__error {\n  background-color: #DE636F;\n  border-bottom: 1px solid #CA5A65;\n  color: #fff;\n}\n\n.noty_theme__mint.noty_type__info,\n.noty_theme__mint.noty_type__information {\n  background-color: #7F7EFF;\n  border-bottom: 1px solid #7473E8;\n  color: #fff;\n}\n\n.noty_theme__mint.noty_type__success {\n  background-color: #AFC765;\n  border-bottom: 1px solid #A0B55C;\n  color: #fff;\n}\n\n* {\n  margin: 0;\n}\n\nhtml,\nbody {\n  height: 100%;\n  width: 100%;\n}\n\nbutton:focus {\n  outline: none;\n}\n\nbody {\n  font-family: \"Lato\", \"sans-serif\";\n  -webkit-font-smoothing: antialiased;\n  color: #232323;\n  width: 100%;\n}\n\nnav {\n  position: relative;\n  min-height: 120px;\n}\n\n.nav-wrapper {\n  display: inline-block;\n  padding: 10px;\n  position: absolute;\n  top: 20%;\n  right: 1%;\n}\n\n.nav-wrapper ul li {\n  display: inline-block;\n  margin: 0 10px;\n  padding: 5px;\n  font-size: 18px;\n}\n\n.nav-wrapper ul li:last-child {\n  position: relative;\n}\n\n.total-counter {\n  position: absolute;\n  background: #64a0ff;\n  color: white;\n  width: 20px;\n  height: 20px;\n  border-radius: 50%;\n  padding: 2px 0px 0 6px;\n  font-size: 13px;\n  font-weight: bold;\n  top: -10%;\n  right: -20%;\n}\n\n.nav-wrapper ul li a {\n  color: #FE5F1E;\n  text-decoration: none;\n}\n\n.cart {\n  width: 44px;\n  height: 30px;\n}\n\n.logo-wrapper {\n  position: absolute;\n  top: 5%;\n  left: 0%;\n  display: inline-block;\n}\n\n.logo-wrapper img {\n  width: 150px;\n  height: 120px;\n}\n\n.logo-wrapper span {\n  position: absolute;\n  top: 40%;\n  left: 100%;\n  letter-spacing: 6px;\n  color: #FE5F1E;\n  font-size: 23px;\n  font-weight: 600;\n}\n\n.intro-container {\n  position: relative;\n  height: 80%;\n  width: 100%;\n  background: #f8f8f8;\n  left: 0;\n}\n\n.banner {\n  position: absolute;\n  right: 0%;\n  top: 14%;\n  width: 34%;\n  height: 79%;\n}\n\n.caption {\n  font-size: 20px;\n  letter-spacing: 2px;\n  padding: 10px;\n  position: absolute;\n  top: 40%;\n  left: 5%;\n}\n\n.caption h1 {\n  color: #232323;\n  font-size: 50px;\n  letter-spacing: 6px;\n  margin: 20px 0;\n}\n\n.order {\n  background: #FE5F1E;\n  color: #fff;\n  padding: 7px;\n  border: 1px white solid;\n  border-radius: 6px;\n  text-decoration: none;\n  width: 60%;\n  display: block;\n  text-align: center;\n}\n\n.order:hover {\n  background-color: #232323;\n  color: #fff;\n}\n\n.nav-wrapper ul li a:hover {\n  color: #232323;\n}\n\n.menu-container {\n  height: 100%;\n  position: relative;\n  width: 100%;\n}\n\n.menu-container h2 {\n  font-size: 30px;\n  margin: 30px;\n  font-weight: bold;\n  color: #FE5F1E;\n  letter-spacing: 5px;\n}\n\n.menu-item img {\n  width: 50%;\n  height: 50%;\n  display: block;\n  margin: auto;\n}\n\n.menu-item .item-name {\n  display: block;\n  text-align: center;\n  font-weight: 700;\n  letter-spacing: 2px;\n  font-size: 18px;\n  color: #232323;\n  margin: 5px 0;\n}\n\n.menu-item .item-price {\n  display: inline-block;\n  width: 40%;\n  text-align: left;\n  padding: 5px;\n  padding-left: 20px;\n  font-weight: 500;\n  color: #232323;\n}\n\n.menu-item button {\n  background: #FE5F1E;\n  color: #fff;\n  word-spacing: 10px;\n  padding: 5px;\n  border: 1px white solid;\n  border-radius: 5px;\n  margin-left: 30px;\n}\n\n.menu-item button:focus {\n  outline: none;\n}\n\n.cart-empty h1, .cart-nonempty h1 {\n  color: #232323;\n  text-align: center;\n  font-weight: 700;\n  font-size: 30px;\n  margin: 20px 0;\n  letter-spacing: 3px;\n}\n\n.cart-empty p {\n  font-size: 20px;\n  margin: auto;\n  text-align: center;\n  padding: 5px;\n}\n\n.img-wrapper {\n  width: 40%;\n  margin: auto;\n}\n\n.img-wrapper img {\n  width: 100%;\n  height: 100%;\n}\n\n.cart-empty a {\n  background: #FE5F1E;\n  color: #fff;\n  padding: 7px;\n  border: 1px white solid;\n  border-radius: 6px;\n  text-decoration: none;\n  width: 100px;\n  margin: 10px auto;\n  display: block;\n  text-align: center;\n}\n\n.cart-empty a:hover {\n  background-color: #232323;\n  color: #fff;\n}\n\n.cart-nonempty {\n  background: #f8f8f8;\n  min-height: 100%;\n}\n\n.counter-container {\n  width: 70%;\n  margin: auto;\n}\n\n.cart-nonempty h1 {\n  font-size: 20px;\n  padding: 20px;\n  text-align: left;\n  letter-spacing: 2px;\n}\n\n.counter {\n  padding-bottom: 15px;\n  border-bottom: 1px #ccc solid;\n}\n\n.pizza-display img {\n  width: 30%;\n  display: block;\n  margin: auto;\n}\n\n.pizza-name {\n  display: block;\n  width: 100%;\n  text-align: center;\n  font-size: 18px;\n  color: #FE5F1E;\n}\n\n.pizza-size {\n  display: block;\n  width: 100%;\n  text-align: center;\n  font-size: 16px;\n  color: #ccc;\n}\n\n.pizza-price, .pizza-number {\n  display: block;\n  width: 100%;\n  align-self: center;\n  text-align: center;\n  font-size: 18px;\n  color: #232323;\n}\n\n.total {\n  padding: 20px;\n  text-align: right;\n}\n\n.total span {\n  color: #FE5F1E;\n  padding: 0 5px;\n}\n\n.address {\n  margin: 10px 0;\n  text-align: right;\n  position: relative;\n}\n\n.address input {\n  width: 40%;\n  height: 20px;\n  position: absolute;\n  padding: 10px;\n  right: 0;\n  border: 1px #ccc solid;\n  border-radius: 1px;\n}\n\n.address button {\n  background: #FE5F1E;\n  color: #fff;\n  border-radius: 10px;\n  padding: 7px;\n  font-size: 15px;\n  border: 1px #ccc solid;\n  position: absolute;\n  top: 40px;\n  right: 0;\n}\n\n.login-container, .register-container {\n  background: #f8f8f8;\n}\n\n.login-container input, .register-container input {\n  margin: 20px auto;\n}\n\n.login-button {\n  background: #FE5F1E;\n  color: #fff;\n  font-size: 16px;\n  padding: 10px;\n  border-radius: 10px;\n  border: 1px #ccc solid;\n}\n\n.login-button:hover {\n  background: black;\n}\n\n.forgot-pw {\n  color: #FE5F1E;\n  font-weight: 700;\n}\n\n.forgot-pw:hover {\n  color: #232323;\n}\n\n.auth-error {\n  color: red;\n  font-size: 14px;\n  padding: 10px;\n  text-align: center;\n}\n\n.logged-in-name {\n  font-size: 16px;\n  font-weight: 501;\n  position: absolute;\n  top: 10%;\n  right: 9%;\n  color: orange;\n}\n\n.not-logged-in-msg {\n  color: red;\n  font-weight: 600;\n  font-size: 16px;\n  padding: 10px;\n  text-align: center;\n}\n\n.not-logged-in-msg a {\n  color: blue;\n  text-decoration: underline;\n  display: inline-block;\n  padding: 0 5px;\n}\n\n.order-thead {\n  padding: 5px;\n  border: 1px solid gray;\n}\n\n.order-thead div {\n  border-left: 1px solid gray;\n  text-align: center;\n}\n\n.order-row {\n  padding: 5px;\n  transition: all 3s ease;\n}\n\n.order-row div {\n  text-align: center;\n  padding: 3px;\n  border-left: 1px solid gray;\n  border-bottom: 1px solid gray;\n}\n\n@keyframes shake {\n  33% {\n    transform: rotate(50deg);\n  }\n  66% {\n    transform: rotate(-50deg);\n  }\n}\n.track-container {\n  background: #f8f8f8;\n  width: 100%;\n  height: 600px;\n}\n\n.tracking-section {\n  width: 70%;\n  margin: 20px auto;\n  padding-top: 100px;\n  height: 500px;\n}\n\n.order-info {\n  position: relative;\n}\n\n.order-info h1 {\n  font-weight: 600;\n  position: absolute;\n}\n\n.order-info .order-id {\n  position: absolute;\n  right: 0;\n  color: orange;\n}\n\n.order-status {\n  margin: 50px;\n  position: relative;\n  left: 18%;\n  top: 3%;\n}\n\n.order-status li {\n  margin: 50px;\n  width: 300px;\n  font-size: 16px;\n  position: relative;\n  letter-spacing: 1.5px;\n}\n\n.order-status li .icon {\n  font-size: 30px;\n  position: absolute;\n  right: 0;\n  top: -5px;\n  transition: transform 2s ease;\n  transform: scale(1.2);\n}\n\n.orders-small {\n  display: none;\n}\n\n.order-status li:before {\n  content: \"\";\n  background: black;\n  border-radius: 50%;\n  width: 10px;\n  height: 10px;\n  right: 88px;\n  top: 7px;\n  position: absolute;\n}\n\n.order-status li:after {\n  content: \"\";\n  background: black;\n  width: 2px;\n  height: 188%;\n  margin-top: 15px;\n  right: 92px;\n  top: 10px;\n  position: absolute;\n}\n\n@media screen and (max-width: 650px) {\n  .menu-item .item-price {\n    text-align: center;\n  }\n\n  .banner {\n    right: 1%;\n    top: 41%;\n    width: 43%;\n    height: 180px;\n  }\n\n  .order-status {\n    margin: 0;\n    left: 0;\n    width: 100%;\n    top: 5%;\n  }\n\n  .order-info {\n    padding: 10px;\n  }\n\n  .order-info h1 {\n    position: static;\n    font-size: 14px;\n  }\n\n  .order-info .order-id {\n    position: static;\n    font-size: 13px;\n  }\n\n  .tracking-section {\n    padding-top: 36px;\n  }\n\n  .order-status li {\n    font-size: 13px;\n    margin: 30px;\n  }\n\n  .tracking-container {\n    height: 450px;\n  }\n\n  .tracking-section {\n    width: 100%;\n  }\n\n  .orders-small {\n    display: block;\n  }\n\n  .success-alert {\n    font-size: 14px;\n  }\n\n  .orders {\n    display: none;\n  }\n\n  .auth-error {\n    font-size: 13px;\n  }\n\n  .caption {\n    font-size: 14px;\n    top: 17%;\n    left: 4%;\n  }\n\n  .order {\n    width: 50%;\n  }\n\n  .caption h1 {\n    font-size: 35px;\n  }\n\n  .intro-container {\n    height: 50%;\n  }\n\n  .menu-container h2 {\n    font-size: 20px;\n  }\n\n  .menu-item img {\n    height: 90px;\n  }\n\n  .menu-item .item-name {\n    font-size: 14px;\n  }\n\n  .logo-wrapper img {\n    margin: 5px;\n    display: inline;\n    height: 100px;\n  }\n\n  .logo-wrapper {\n    position: static;\n    text-align: center;\n    display: block;\n  }\n\n  .logo-wrapper span {\n    position: static;\n  }\n\n  .nav-wrapper {\n    display: block;\n    text-align: center;\n    position: static;\n  }\n\n  .cart-nonempty h1 {\n    font-size: 16px;\n  }\n\n  .not-logged-in-msg {\n    font-size: 14px;\n    padding: 0;\n  }\n\n  .pizza-name, .pizza-size, .pizza-number, .pizza-price {\n    font-size: 14px;\n  }\n\n  .cart-nonempty {\n    min-height: 0;\n  }\n\n  .sign-in-msg {\n    font-size: 16px;\n  }\n\n  .login-container input, .register-container input {\n    padding: 5px;\n    font-size: 13px;\n    margin: 20px auto;\n  }\n\n  .login-button {\n    font-size: 14px;\n  }\n\n  .address input {\n    width: 60%;\n  }\n\n  .address button {\n    font-size: 13px;\n  }\n\n  .logged-in-name {\n    font-size: 13px;\n    top: 5%;\n  }\n\n  .cart-empty p {\n    font-size: 14px;\n  }\n\n  .cart-empty h1 {\n    font-size: 20px;\n  }\n\n  .cart-empty a {\n    font-size: 13px;\n  }\n\n  .forgot-pw {\n    font-size: 15px;\n  }\n}", "",{"version":3,"sources":["webpack://./node_modules/noty/src/noty.scss","webpack://./resources/scss/scss.scss","webpack://./node_modules/noty/src/themes/mint.scss","webpack://./resources/scss/_variables.scss"],"names":[],"mappings":"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","sourcesContent":["$noty-primary-color: #333;\n$noty-default-width: 325px;\n$noty-corner-space: 20px;\n\n.noty_layout_mixin {\n  position: fixed;\n  margin: 0;\n  padding: 0;\n  z-index: 9999999;\n  transform: translateZ(0) scale(1.0, 1.0);\n  backface-visibility: hidden;\n  -webkit-font-smoothing: subpixel-antialiased;\n  filter: blur(0);\n  -webkit-filter: blur(0);\n  max-width: 90%;\n}\n\n#noty_layout__top {\n  @extend .noty_layout_mixin;\n  top: 0;\n  left: 5%;\n  width: 90%;\n}\n\n#noty_layout__topLeft {\n  @extend .noty_layout_mixin;\n  top: $noty-corner-space;\n  left: $noty-corner-space;\n  width: $noty-default-width;\n}\n\n#noty_layout__topCenter {\n  @extend .noty_layout_mixin;\n  top: 5%;\n  left: 50%;\n  width: $noty-default-width;\n  transform: translate(calc(-50% - .5px)) translateZ(0) scale(1.0, 1.0);\n}\n\n#noty_layout__topRight {\n  @extend .noty_layout_mixin;\n  top: $noty-corner-space;\n  right: $noty-corner-space;\n  width: $noty-default-width;\n}\n\n#noty_layout__bottom {\n  @extend .noty_layout_mixin;\n  bottom: 0;\n  left: 5%;\n  width: 90%;\n}\n\n#noty_layout__bottomLeft {\n  @extend .noty_layout_mixin;\n  bottom: $noty-corner-space;\n  left: $noty-corner-space;\n  width: $noty-default-width;\n}\n\n#noty_layout__bottomCenter {\n  @extend .noty_layout_mixin;\n  bottom: 5%;\n  left: 50%;\n  width: $noty-default-width;\n  transform: translate(calc(-50% - .5px)) translateZ(0) scale(1.0, 1.0);\n}\n\n#noty_layout__bottomRight {\n  @extend .noty_layout_mixin;\n  bottom: $noty-corner-space;\n  right: $noty-corner-space;\n  width: $noty-default-width;\n}\n\n#noty_layout__center {\n  @extend .noty_layout_mixin;\n  top: 50%;\n  left: 50%;\n  width: $noty-default-width;\n  transform: translate(calc(-50% - .5px), calc(-50% - .5px)) translateZ(0) scale(1.0, 1.0);\n}\n\n#noty_layout__centerLeft {\n  @extend .noty_layout_mixin;\n  top: 50%;\n  left: $noty-corner-space;\n  width: $noty-default-width;\n  transform: translate(0, calc(-50% - .5px)) translateZ(0) scale(1.0, 1.0);\n}\n\n#noty_layout__centerRight {\n  @extend .noty_layout_mixin;\n  top: 50%;\n  right: $noty-corner-space;\n  width: $noty-default-width;\n  transform: translate(0, calc(-50% - .5px)) translateZ(0) scale(1, 1);\n}\n\n.noty_progressbar {\n  display: none;\n}\n\n.noty_has_timeout.noty_has_progressbar .noty_progressbar {\n  display: block;\n  position: absolute;\n  left: 0;\n  bottom: 0;\n  height: 3px;\n  width: 100%;\n  background-color: #646464;\n  opacity: 0.2;\n  filter: alpha(opacity=10)\n}\n\n.noty_bar {\n  -webkit-backface-visibility: hidden;\n  -webkit-transform: translate(0, 0) translateZ(0) scale(1.0, 1.0);\n  transform: translate(0, 0) scale(1.0, 1.0);\n  -webkit-font-smoothing: subpixel-antialiased;\n  overflow: hidden;\n}\n\n.noty_effects_open {\n  opacity: 0;\n  transform: translate(50%);\n  animation: noty_anim_in .5s cubic-bezier(0.68, -0.55, 0.265, 1.55);\n  animation-fill-mode: forwards;\n}\n\n.noty_effects_close {\n  animation: noty_anim_out .5s cubic-bezier(0.68, -0.55, 0.265, 1.55);\n  animation-fill-mode: forwards;\n}\n\n.noty_fix_effects_height {\n  animation: noty_anim_height 75ms ease-out;\n}\n\n.noty_close_with_click {\n  cursor: pointer;\n}\n\n.noty_close_button {\n  position: absolute;\n  top: 2px;\n  right: 2px;\n  font-weight: bold;\n  width: 20px;\n  height: 20px;\n  text-align: center;\n  line-height: 20px;\n  background-color: rgba(0, 0, 0, .05);\n  border-radius: 2px;\n  cursor: pointer;\n  transition: all .2s ease-out;\n}\n\n.noty_close_button:hover {\n  background-color: rgba(0, 0, 0, .1);\n}\n\n.noty_modal {\n  position: fixed;\n  width: 100%;\n  height: 100%;\n  background-color: #000;\n  z-index: 10000;\n  opacity: .3;\n  left: 0;\n  top: 0;\n}\n\n.noty_modal.noty_modal_open {\n  opacity: 0;\n  animation: noty_modal_in .3s ease-out;\n}\n.noty_modal.noty_modal_close {\n  animation: noty_modal_out .3s ease-out;\n  animation-fill-mode: forwards;\n}\n\n@keyframes noty_modal_in {\n  100% {\n    opacity: .3;\n  }\n}\n@keyframes noty_modal_out {\n  100% {\n    opacity: 0;\n  }\n}\n\n@keyframes noty_modal_out {\n  100% {\n    opacity: 0;\n  }\n}\n\n@keyframes noty_anim_in {\n  100% {\n    transform: translate(0);\n    opacity: 1;\n  }\n}\n\n@keyframes noty_anim_out {\n  100% {\n    transform: translate(50%);\n    opacity: 0;\n  }\n}\n\n@keyframes noty_anim_height {\n  100% {\n    height: 0;\n  }\n}\n\n//@import \"themes/relax\";\n//@import \"themes/metroui\";\n//@import \"themes/mint\";\n//@import \"themes/sunset\";\n//@import \"themes/bootstrap-v3\";\n//@import \"themes/bootstrap-v4\";\n//@import \"themes/semanticui\";\n//@import \"themes/nest\";\n//@import \"themes/light\";\n","@import './variables';\r\n@import '~noty/src/noty.scss';\r\n@import '~noty/src/themes/mint.scss';\r\n* {\r\n  margin: 0;\r\n}\r\n\r\nhtml,\r\nbody {\r\n  height: 100%;\r\n  width: 100%;\r\n}\r\n\r\nbutton:focus{\r\n  outline:none;\r\n}\r\n\r\nbody {\r\n  font-family: \"Lato\", \"sans-serif\";\r\n  -webkit-font-smoothing: antialiased;\r\n  color: #232323;\r\n  width : 100%;\r\n}\r\n\r\nnav {\r\n  position: relative;\r\n  min-height: 120px;\r\n}\r\n\r\n.nav-wrapper {\r\n  display: inline-block;\r\n  padding: 10px;\r\n  position: absolute;\r\n  top: 20%;\r\n  right: 1%;\r\n}\r\n\r\n.nav-wrapper ul li {\r\n  display: inline-block;\r\n  margin: 0 10px;\r\n  padding: 5px;\r\n  font-size: 18px;\r\n}\r\n\r\n.nav-wrapper ul li:last-child{\r\nposition:relative;\r\n}\r\n\r\n.total-counter {\r\n    position: absolute;\r\n    background: rgba(100,160,255,1);\r\n    color: white;\r\n    width: 20px;\r\n    height: 20px;\r\n    border-radius: 50%;\r\n    padding: 2px 0px 0 6px;\r\n    font-size: 13px;\r\n    font-weight: bold;\r\n    top: -10%;\r\n    right: -20%;\r\n}\r\n\r\n.nav-wrapper ul li a {\r\n  color: #FE5F1E;\r\n  text-decoration: none;\r\n}\r\n\r\n.cart {\r\n  width: 44px;\r\n  height: 30px;\r\n}\r\n\r\n.logo-wrapper {\r\n  position: absolute;\r\n  top: 5%;\r\n  left: 0%;\r\n  display: inline-block;\r\n}\r\n\r\n.logo-wrapper img {\r\n  width: 150px;\r\n  height: 120px;\r\n}\r\n\r\n.logo-wrapper span {\r\n  position: absolute;\r\n  top: 40%;\r\n  left: 100%;\r\n  letter-spacing: 6px;\r\n  color: #FE5F1E;\r\n  font-size: 23px;\r\n  font-weight: 600;\r\n}\r\n\r\n.intro-container {\r\n  position: relative;\r\n  height: 80%;\r\n  width: 100%;\r\n  background: #f8f8f8;\r\n  left: 0;\r\n}\r\n\r\n.banner {\r\n  position: absolute;\r\n  right: 0%;\r\n  top: 14%;\r\n  width: 34%;\r\n  height: 79%;\r\n}\r\n\r\n.caption {\r\n  font-size: 20px;\r\n  letter-spacing: 2px;\r\n  padding: 10px;\r\n  position: absolute;\r\n  top: 40%;\r\n  left: 5%;\r\n}\r\n\r\n.caption h1 {\r\n  color: #232323;\r\n  font-size: 50px;\r\n  letter-spacing: 6px;\r\n  margin: 20px 0;\r\n}\r\n\r\n.order {\r\n  background: #FE5F1E;\r\n  color: #fff;\r\n  padding: 7px;\r\n  border: 1px white solid;\r\n  border-radius: 6px;\r\n  text-decoration: none;\r\n  width: 60%;\r\n  display: block;\r\n  text-align: center;\r\n}\r\n\r\n.order:hover {\r\nbackground-color:$dark;\r\ncolor:$pure;\r\n\r\n}\r\n\r\n.nav-wrapper ul li a:hover {\r\n  color: #232323;\r\n}\r\n\r\n.menu-container {\r\n  height: 100%;\r\n  position: relative;\r\n  width: 100%;\r\n}\r\n\r\n.menu-container h2 {\r\n  font-size: 30px;\r\n  margin: 30px;\r\n  font-weight:bold;\r\n  color:$primary;\r\n  letter-spacing: 5px;\r\n}\r\n\r\n.menu-item img {\r\n  width: 50%;\r\n  height: 50%;\r\n  display: block;\r\n  margin: auto;\r\n}\r\n\r\n.menu-item .item-name {\r\n  display: block;\r\n  text-align: center;\r\n  font-weight:700;\r\n  letter-spacing: 2px;\r\n  font-size: 18px;\r\n  color: #232323;\r\n  margin: 5px 0;\r\n}\r\n\r\n.menu-item .item-price {\r\n  display: inline-block;\r\n  width: 40%;\r\n  text-align: left;\r\n  padding: 5px;\r\n  padding-left: 20px;\r\n  font-weight: 500;\r\n  color: #232323;\r\n}\r\n\r\n.menu-item button {\r\n  background: #FE5F1E;\r\n  color: #fff;\r\n  word-spacing: 10px;\r\n  padding: 5px;\r\n  border: 1px white solid;\r\n  border-radius: 5px;\r\n  margin-left: 30px;\r\n}\r\n\r\n\r\n.menu-item button:focus{\r\n  outline : none;\r\n}\r\n\r\n.cart-empty h1, .cart-nonempty h1{\r\n  color:$dark;\r\n  text-align:center;\r\n  font-weight:700;\r\n  font-size:30px;\r\n  margin:20px 0;\r\n  letter-spacing: 3px;\r\n}\r\n\r\n.cart-empty p{\r\n  font-size:20px;\r\n  margin:auto;\r\n  text-align:center;\r\n  padding:5px;\r\n}\r\n\r\n.img-wrapper{\r\n  width:40%;\r\n  margin:auto;\r\n}\r\n\r\n.img-wrapper img{\r\n  width:100%;\r\n  height:100%;\r\n}\r\n\r\n.cart-empty a{\r\n  background: #FE5F1E;\r\n  color: #fff;\r\n  padding: 7px;\r\n  border: 1px white solid;\r\n  border-radius: 6px;\r\n  text-decoration: none;\r\n  width: 100px;\r\n  margin:10px auto;\r\n  display: block;\r\n  text-align: center;\r\n}\r\n\r\n.cart-empty a:hover {\r\nbackground-color:$dark;\r\ncolor:$pure;\r\n}\r\n\r\n.cart-nonempty{\r\n  background:$secondary;\r\n  min-height:100%;\r\n}\r\n\r\n.counter-container{\r\n  width:70%;\r\n  margin:auto;\r\n}\r\n\r\n.cart-nonempty h1{\r\n  font-size:20px;\r\n  padding:20px;\r\n  text-align:left;\r\n  letter-spacing:2px;\r\n}\r\n\r\n.counter{\r\npadding-bottom:15px;\r\nborder-bottom:1px $gray solid;\r\n}\r\n\r\n\r\n.pizza-display img{\r\nwidth:30%;\r\ndisplay:block;\r\nmargin:auto;\r\n}\r\n\r\n.pizza-name{\r\n  display:block;\r\n  width:100%;\r\n  text-align:center;\r\n  font-size:18px;\r\n  color:$primary;\r\n}\r\n\r\n.pizza-size{\r\n  display:block;\r\n  width:100%;\r\n  text-align:center;\r\n  font-size:16px;\r\n  color:$gray;\r\n}\r\n\r\n.pizza-price, .pizza-number{\r\n  display:block;\r\n  width:100%;\r\n  align-self:center;\r\n  text-align:center;\r\n  font-size:18px;\r\n  color:$dark;\r\n}\r\n\r\n.total{\r\n  padding:20px;\r\n   text-align:right;\r\n}\r\n\r\n.total span{\r\n color:$primary;\r\n padding:0 5px;\r\n}\r\n\r\n.address{\r\n  margin:10px 0;\r\n  text-align:right;\r\n  position:relative;\r\n}\r\n\r\n.address input{\r\n  width:40%;\r\n  height:20px;\r\n  position:absolute;\r\n  padding:10px;\r\n  right:0;\r\n  border:1px $gray solid;\r\n  border-radius:1px;\r\n}\r\n\r\n.address button{\r\n  background:$primary;\r\n  color:$pure;\r\n  border-radius:10px;\r\n  padding:7px;\r\n  font-size:15px;\r\n  border:1px $gray solid;\r\n  position:absolute;\r\n  top:40px;\r\n  right:0;\r\n}\r\n\r\n//login and registration\r\n\r\n.login-container, .register-container{\r\n  background:$secondary;\r\n}\r\n\r\n.login-container input, .register-container input{\r\n  margin:20px auto;\r\n}\r\n\r\n.login-button{\r\n  background:$primary;\r\n  color:$pure;\r\n  font-size:16px;\r\n  padding:10px;\r\n  border-radius:10px;\r\n  border:1px $gray solid;\r\n}\r\n\r\n.login-button:hover{\r\n  background : black;\r\n}\r\n.forgot-pw{\r\n  color:$primary;\r\n  font-weight:700;\r\n}\r\n\r\n.forgot-pw:hover{\r\n  color:$dark;\r\n}\r\n\r\n.auth-error{\r\n  color:red;\r\n  font-size:14px;\r\n  padding:10px;\r\n  text-align:center;\r\n}\r\n\r\n.logged-in-name{\r\n  font-size: 16px;\r\nfont-weight: 501;\r\nposition: absolute;\r\ntop: 10%;\r\nright: 9%;\r\ncolor: orange;\r\n}\r\n\r\n.not-logged-in-msg{\r\n  color : red;\r\n  font-weight : 600;\r\n  font-size:16px;\r\n  padding:10px;\r\n  text-align:center;\r\n}\r\n\r\n.not-logged-in-msg a{\r\n  color: blue;\r\n  text-decoration: underline;\r\n  display : inline-block;\r\n  padding: 0 5px;\r\n}\r\n\r\n.order-thead{\r\n  padding : 5px;\r\n  border : 1px solid gray;\r\n}\r\n\r\n.order-thead div{\r\n  border-left : 1px solid gray;\r\n  text-align : center;\r\n}\r\n\r\n.order-row{\r\n  padding : 5px;\r\n  transition: all 3s ease;\r\n}\r\n\r\n.order-row div{\r\n  text-align : center;\r\n  padding : 3px;\r\n  border-left : 1px solid gray;\r\n  border-bottom: 1px solid gray;\r\n}\r\n\r\n@keyframes shake{\r\n  33%{\r\n    transform : rotate(50deg)\r\n  }\r\n\r\n  66%{\r\n    transform: rotate(-50deg)\r\n  }\r\n}\r\n\r\n.track-container{\r\n  background : #f8f8f8;\r\n  width : 100%;\r\n  height : 600px;\r\n}\r\n\r\n.tracking-section{\r\n  width : 70%;\r\n  margin : 20px auto;\r\n  padding-top : 100px;\r\n  height : 500px;\r\n}\r\n\r\n.order-info{\r\n  position: relative;\r\n}\r\n\r\n.order-info h1{\r\n  font-weight: 600;\r\nposition: absolute;\r\n}\r\n\r\n.order-info .order-id{\r\n  position: absolute;\r\n    right: 0;\r\n    color: orange;\r\n}\r\n\r\n.order-status {\r\n  margin : 50px;\r\n  position: relative;\r\n  left: 18%;\r\n  top : 3%;\r\n}\r\n\r\n.order-status li{\r\n  margin: 50px;\r\n  width : 300px;\r\n    font-size: 16px;\r\n    position: relative;\r\n    letter-spacing: 1.5px;\r\n}\r\n\r\n.order-status li .icon{\r\n  font-size: 30px;\r\n  position: absolute;\r\n  right: 0;\r\n  top : -5px;\r\n  transition : transform 2s ease;\r\n  transform : scale(1.2);\r\n}\r\n\r\n.orders-small{\r\n  display : none;\r\n}\r\n\r\n.order-status li:before{\r\n  content : '';\r\n  background : black;\r\n  border-radius : 50%;\r\n  width : 10px;\r\n  height : 10px;\r\n  right : 88px;\r\n  top : 7px;\r\n  position: absolute;\r\n}\r\n\r\n.order-status li:after{\r\n  content: \"\";\r\n    background: black;\r\n    width: 2px;\r\n    height: 188%;\r\n    margin-top: 15px;\r\n    right: 92px;\r\n    top: 10px;\r\n    position: absolute;\r\n}\r\n\r\n\r\n@media screen and (max-width : 650px) {\r\n  .menu-item .item-price{\r\n    text-align: center;\r\n  }\r\n  .banner {\r\n    right: 1%;\r\n   top: 41%;\r\n   width: 43%;\r\n   height: 180px;\r\n }\r\n\r\n .order-status{\r\n   margin : 0;\r\n   left : 0;\r\n   width : 100%;\r\n   top : 5%;\r\n }\r\n\r\n .order-info{\r\n   padding : 10px;\r\n }\r\n\r\n .order-info h1{\r\n   position: static;\r\n   font-size : 14px;\r\n }\r\n\r\n .order-info .order-id{\r\n   position: static;\r\n   font-size : 13px;\r\n }\r\n\r\n .tracking-section{\r\n   padding-top : 36px;\r\n }\r\n\r\n .order-status li {\r\n   font-size: 13px;\r\n   margin : 30px;\r\n }\r\n\r\n .tracking-container{\r\n   height : 450px;\r\n }\r\n\r\n .tracking-section{\r\n   width : 100%;\r\n }\r\n\r\n .orders-small{\r\n   display: block;\r\n }\r\n .success-alert{\r\n   font-size: 14px;\r\n }\r\n .orders{\r\n   display : none;\r\n }\r\n .auth-error{\r\n   font-size: 13px;\r\n }\r\n  .caption{\r\n    font-size: 14px;\r\n    top: 17%;\r\n    left: 4%;\r\n}\r\n.order{\r\n  width : 50%;\r\n}\r\n.caption h1{\r\n  font-size : 35px;\r\n}\r\n.intro-container{\r\n  height : 50%;\r\n}\r\n.menu-container h2{\r\n  font-size : 20px;\r\n}\r\n.menu-item img{\r\n  height : 90px;\r\n}\r\n.menu-item .item-name{\r\n  font-size : 14px;\r\n}\r\n.logo-wrapper img{\r\n  margin: 5px;\r\n    display: inline;\r\n    height: 100px;\r\n}\r\n.logo-wrapper{\r\n  position : static;\r\n  text-align : center;\r\n  display : block;\r\n}\r\n.logo-wrapper span{\r\n  position: static;\r\n}\r\n.nav-wrapper{\r\n  display: block;\r\n  text-align: center;\r\n  position: static;\r\n}\r\n.cart-nonempty h1{\r\n  font-size: 16px;\r\n}\r\n.not-logged-in-msg{\r\n  font-size: 14px;\r\n  padding: 0;\r\n}\r\n.pizza-name, .pizza-size, .pizza-number, .pizza-price{\r\n  font-size: 14px;\r\n}\r\n.cart-nonempty{\r\n  min-height : 0;\r\n}\r\n.sign-in-msg{\r\n  font-size : 16px;\r\n}\r\n\r\n.login-container input, .register-container input{\r\n  padding: 5px;\r\n    font-size: 13px;\r\n    margin: 20px auto;\r\n}\r\n.login-button{\r\n  font-size : 14px;\r\n}\r\n.address input{\r\n  width : 60%;\r\n}\r\n.address button{\r\n  font-size: 13px;\r\n}\r\n.logged-in-name{\r\n  font-size: 13px;\r\n  top: 5%;\r\n}\r\n.cart-empty p{\r\n  font-size : 14px;\r\n}\r\n.cart-empty h1{\r\n  font-size: 20px;\r\n}\r\n.cart-empty a{\r\n  font-size: 13px;\r\n}\r\n.forgot-pw{\r\n  font-size: 15px;\r\n}\r\n}\r\n",".noty_theme__mint.noty_bar {\r\n  margin: 4px 0;\r\n  overflow: hidden;\r\n  border-radius: 2px;\r\n  position: relative;\r\n\r\n  .noty_body {\r\n\tpadding: 10px;\r\n\tfont-size: 14px;\r\n  }\r\n\r\n  .noty_buttons {\r\n\tpadding: 10px;\r\n  }\r\n}\r\n\r\n.noty_theme__mint.noty_type__alert,\r\n.noty_theme__mint.noty_type__notification {\r\n  background-color: #fff;\r\n  border-bottom: 1px solid #D1D1D1;\r\n  color: #2F2F2F;\r\n}\r\n\r\n.noty_theme__mint.noty_type__warning {\r\n  background-color: #FFAE42;\r\n  border-bottom: 1px solid #E89F3C;\r\n  color: #fff;\r\n}\r\n\r\n.noty_theme__mint.noty_type__error {\r\n  background-color: #DE636F;\r\n  border-bottom: 1px solid #CA5A65;\r\n  color: #fff;\r\n}\r\n\r\n.noty_theme__mint.noty_type__info,\r\n.noty_theme__mint.noty_type__information {\r\n  background-color: #7F7EFF;\r\n  border-bottom: 1px solid #7473E8;\r\n  color: #fff;\r\n}\r\n\r\n.noty_theme__mint.noty_type__success {\r\n  background-color: #AFC765;\r\n  border-bottom: 1px solid #A0B55C;\r\n  color: #fff;\r\n}\r\n","// Colors\r\n$primary: #FE5F1E;\r\n$primary-hover: #b23301;\r\n$secondary: #f8f8f8;\r\n$pure:#fff;\r\n$dark:#232323;\r\n$gray:#ccc;\r\n"],"sourceRoot":""}]);
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (___CSS_LOADER_EXPORT___);


/***/ }),

/***/ "./node_modules/css-loader/dist/runtime/api.js":
/*!*****************************************************!*\
  !*** ./node_modules/css-loader/dist/runtime/api.js ***!
  \*****************************************************/
/***/ ((module) => {

"use strict";


/*
  MIT License http://www.opensource.org/licenses/mit-license.php
  Author Tobias Koppers @sokra
*/
// css base code, injected by the css-loader
// eslint-disable-next-line func-names
module.exports = function (cssWithMappingToString) {
  var list = []; // return the list of modules as css string

  list.toString = function toString() {
    return this.map(function (item) {
      var content = cssWithMappingToString(item);

      if (item[2]) {
        return "@media ".concat(item[2], " {").concat(content, "}");
      }

      return content;
    }).join('');
  }; // import a list of modules into the list
  // eslint-disable-next-line func-names


  list.i = function (modules, mediaQuery, dedupe) {
    if (typeof modules === 'string') {
      // eslint-disable-next-line no-param-reassign
      modules = [[null, modules, '']];
    }

    var alreadyImportedModules = {};

    if (dedupe) {
      for (var i = 0; i < this.length; i++) {
        // eslint-disable-next-line prefer-destructuring
        var id = this[i][0];

        if (id != null) {
          alreadyImportedModules[id] = true;
        }
      }
    }

    for (var _i = 0; _i < modules.length; _i++) {
      var item = [].concat(modules[_i]);

      if (dedupe && alreadyImportedModules[item[0]]) {
        // eslint-disable-next-line no-continue
        continue;
      }

      if (mediaQuery) {
        if (!item[2]) {
          item[2] = mediaQuery;
        } else {
          item[2] = "".concat(mediaQuery, " and ").concat(item[2]);
        }
      }

      list.push(item);
    }
  };

  return list;
};

/***/ }),

/***/ "./node_modules/css-loader/dist/runtime/cssWithMappingToString.js":
/*!************************************************************************!*\
  !*** ./node_modules/css-loader/dist/runtime/cssWithMappingToString.js ***!
  \************************************************************************/
/***/ ((module) => {

"use strict";


function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

module.exports = function cssWithMappingToString(item) {
  var _item = _slicedToArray(item, 4),
      content = _item[1],
      cssMapping = _item[3];

  if (typeof btoa === 'function') {
    // eslint-disable-next-line no-undef
    var base64 = btoa(unescape(encodeURIComponent(JSON.stringify(cssMapping))));
    var data = "sourceMappingURL=data:application/json;charset=utf-8;base64,".concat(base64);
    var sourceMapping = "/*# ".concat(data, " */");
    var sourceURLs = cssMapping.sources.map(function (source) {
      return "/*# sourceURL=".concat(cssMapping.sourceRoot || '').concat(source, " */");
    });
    return [content].concat(sourceURLs).concat([sourceMapping]).join('\n');
  }

  return [content].join('\n');
};

/***/ }),

/***/ "./resources/scss/scss.scss":
/*!**********************************!*\
  !*** ./resources/scss/scss.scss ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => __WEBPACK_DEFAULT_EXPORT__
/* harmony export */ });
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js */ "./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_css_loader_dist_cjs_js_node_modules_sass_loader_dist_cjs_js_scss_scss__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! !!../../node_modules/css-loader/dist/cjs.js!../../node_modules/sass-loader/dist/cjs.js!./scss.scss */ "./node_modules/css-loader/dist/cjs.js!./node_modules/sass-loader/dist/cjs.js!./resources/scss/scss.scss");

            

var options = {};

options.insert = "head";
options.singleton = false;

var update = _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default()(_node_modules_css_loader_dist_cjs_js_node_modules_sass_loader_dist_cjs_js_scss_scss__WEBPACK_IMPORTED_MODULE_1__.default, options);



/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (_node_modules_css_loader_dist_cjs_js_node_modules_sass_loader_dist_cjs_js_scss_scss__WEBPACK_IMPORTED_MODULE_1__.default.locals || {});

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js":
/*!****************************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js ***!
  \****************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var isOldIE = function isOldIE() {
  var memo;
  return function memorize() {
    if (typeof memo === 'undefined') {
      // Test for IE <= 9 as proposed by Browserhacks
      // @see http://browserhacks.com/#hack-e71d8692f65334173fee715c222cb805
      // Tests for existence of standard globals is to allow style-loader
      // to operate correctly into non-standard environments
      // @see https://github.com/webpack-contrib/style-loader/issues/177
      memo = Boolean(window && document && document.all && !window.atob);
    }

    return memo;
  };
}();

var getTarget = function getTarget() {
  var memo = {};
  return function memorize(target) {
    if (typeof memo[target] === 'undefined') {
      var styleTarget = document.querySelector(target); // Special case to return head of iframe instead of iframe itself

      if (window.HTMLIFrameElement && styleTarget instanceof window.HTMLIFrameElement) {
        try {
          // This will throw an exception if access to iframe is blocked
          // due to cross-origin restrictions
          styleTarget = styleTarget.contentDocument.head;
        } catch (e) {
          // istanbul ignore next
          styleTarget = null;
        }
      }

      memo[target] = styleTarget;
    }

    return memo[target];
  };
}();

var stylesInDom = [];

function getIndexByIdentifier(identifier) {
  var result = -1;

  for (var i = 0; i < stylesInDom.length; i++) {
    if (stylesInDom[i].identifier === identifier) {
      result = i;
      break;
    }
  }

  return result;
}

function modulesToDom(list, options) {
  var idCountMap = {};
  var identifiers = [];

  for (var i = 0; i < list.length; i++) {
    var item = list[i];
    var id = options.base ? item[0] + options.base : item[0];
    var count = idCountMap[id] || 0;
    var identifier = "".concat(id, " ").concat(count);
    idCountMap[id] = count + 1;
    var index = getIndexByIdentifier(identifier);
    var obj = {
      css: item[1],
      media: item[2],
      sourceMap: item[3]
    };

    if (index !== -1) {
      stylesInDom[index].references++;
      stylesInDom[index].updater(obj);
    } else {
      stylesInDom.push({
        identifier: identifier,
        updater: addStyle(obj, options),
        references: 1
      });
    }

    identifiers.push(identifier);
  }

  return identifiers;
}

function insertStyleElement(options) {
  var style = document.createElement('style');
  var attributes = options.attributes || {};

  if (typeof attributes.nonce === 'undefined') {
    var nonce =  true ? __webpack_require__.nc : 0;

    if (nonce) {
      attributes.nonce = nonce;
    }
  }

  Object.keys(attributes).forEach(function (key) {
    style.setAttribute(key, attributes[key]);
  });

  if (typeof options.insert === 'function') {
    options.insert(style);
  } else {
    var target = getTarget(options.insert || 'head');

    if (!target) {
      throw new Error("Couldn't find a style target. This probably means that the value for the 'insert' parameter is invalid.");
    }

    target.appendChild(style);
  }

  return style;
}

function removeStyleElement(style) {
  // istanbul ignore if
  if (style.parentNode === null) {
    return false;
  }

  style.parentNode.removeChild(style);
}
/* istanbul ignore next  */


var replaceText = function replaceText() {
  var textStore = [];
  return function replace(index, replacement) {
    textStore[index] = replacement;
    return textStore.filter(Boolean).join('\n');
  };
}();

function applyToSingletonTag(style, index, remove, obj) {
  var css = remove ? '' : obj.media ? "@media ".concat(obj.media, " {").concat(obj.css, "}") : obj.css; // For old IE

  /* istanbul ignore if  */

  if (style.styleSheet) {
    style.styleSheet.cssText = replaceText(index, css);
  } else {
    var cssNode = document.createTextNode(css);
    var childNodes = style.childNodes;

    if (childNodes[index]) {
      style.removeChild(childNodes[index]);
    }

    if (childNodes.length) {
      style.insertBefore(cssNode, childNodes[index]);
    } else {
      style.appendChild(cssNode);
    }
  }
}

function applyToTag(style, options, obj) {
  var css = obj.css;
  var media = obj.media;
  var sourceMap = obj.sourceMap;

  if (media) {
    style.setAttribute('media', media);
  } else {
    style.removeAttribute('media');
  }

  if (sourceMap && typeof btoa !== 'undefined') {
    css += "\n/*# sourceMappingURL=data:application/json;base64,".concat(btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))), " */");
  } // For old IE

  /* istanbul ignore if  */


  if (style.styleSheet) {
    style.styleSheet.cssText = css;
  } else {
    while (style.firstChild) {
      style.removeChild(style.firstChild);
    }

    style.appendChild(document.createTextNode(css));
  }
}

var singleton = null;
var singletonCounter = 0;

function addStyle(obj, options) {
  var style;
  var update;
  var remove;

  if (options.singleton) {
    var styleIndex = singletonCounter++;
    style = singleton || (singleton = insertStyleElement(options));
    update = applyToSingletonTag.bind(null, style, styleIndex, false);
    remove = applyToSingletonTag.bind(null, style, styleIndex, true);
  } else {
    style = insertStyleElement(options);
    update = applyToTag.bind(null, style, options);

    remove = function remove() {
      removeStyleElement(style);
    };
  }

  update(obj);
  return function updateStyle(newObj) {
    if (newObj) {
      if (newObj.css === obj.css && newObj.media === obj.media && newObj.sourceMap === obj.sourceMap) {
        return;
      }

      update(obj = newObj);
    } else {
      remove();
    }
  };
}

module.exports = function (list, options) {
  options = options || {}; // Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
  // tags it will allow on a page

  if (!options.singleton && typeof options.singleton !== 'boolean') {
    options.singleton = isOldIE();
  }

  list = list || [];
  var lastIdentifiers = modulesToDom(list, options);
  return function update(newList) {
    newList = newList || [];

    if (Object.prototype.toString.call(newList) !== '[object Array]') {
      return;
    }

    for (var i = 0; i < lastIdentifiers.length; i++) {
      var identifier = lastIdentifiers[i];
      var index = getIndexByIdentifier(identifier);
      stylesInDom[index].references--;
    }

    var newLastIdentifiers = modulesToDom(newList, options);

    for (var _i = 0; _i < lastIdentifiers.length; _i++) {
      var _identifier = lastIdentifiers[_i];

      var _index = getIndexByIdentifier(_identifier);

      if (stylesInDom[_index].references === 0) {
        stylesInDom[_index].updater();

        stylesInDom.splice(_index, 1);
      }
    }

    lastIdentifiers = newLastIdentifiers;
  };
};

/***/ }),

/***/ "./resources/js/customer/cart.js":
/*!***************************************!*\
  !*** ./resources/js/customer/cart.js ***!
  \***************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _scss_scss_scss__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./../../scss/scss.scss */ "./resources/scss/scss.scss");
/* harmony import */ var axios__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! axios */ "./node_modules/axios/index.js");
/* harmony import */ var axios__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(axios__WEBPACK_IMPORTED_MODULE_1__);



let dismiss = document.querySelectorAll('.dismissOrderIcon');
dismiss.forEach(dismissIcon => {
  dismissIcon.onclick = dismissOrder;
});

function dismissOrder(event) {
  let icon = event.currentTarget;
  let id = icon.dataset.id;
  icon.style.animation = "shake 2s infinite";
  icon.style.color = "yellow";
  axios__WEBPACK_IMPORTED_MODULE_1___default().post('/cart/dismissorder', {id}).then(res => {
    icon.style.color = "#4BB543";
    icon.style.animation = "none";

    //update the changes in total quantity and total price
    document.querySelector('.total-counter').innerText = res.data.totalQty;
    document.querySelector('.total-price').innerText = res.data.totalPrice;

    slideAndFade(icon.parentElement);
    setTimeout(() => {
      icon.style.color = "orange";
    }, 3000);
  }).catch(() => {
    icon.style.color = "red";
    icon.style.animation = "none";
    setTimeout(() => {
      icon.style.color = "orange";
    }, 3000);
  });
}

function slideAndFade(elem) {
  elem.style.transform = "translateX(300px)";
  elem.style.opacity = "0";
  setTimeout(() => {
    elem.remove();
  }, 2000);
}


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		if(__webpack_module_cache__[moduleId]) {
/******/ 			return __webpack_module_cache__[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			id: moduleId,
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => module['default'] :
/******/ 				() => module;
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => Object.prototype.hasOwnProperty.call(obj, prop)
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	// startup
/******/ 	// Load entry module
/******/ 	__webpack_require__("./resources/js/customer/cart.js");
/******/ 	// This entry module used 'exports' so it can't be inlined
/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9tb21vdHJhY2tlci8uL25vZGVfbW9kdWxlcy9heGlvcy9pbmRleC5qcyIsIndlYnBhY2s6Ly9tb21vdHJhY2tlci8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvYWRhcHRlcnMveGhyLmpzIiwid2VicGFjazovL21vbW90cmFja2VyLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9heGlvcy5qcyIsIndlYnBhY2s6Ly9tb21vdHJhY2tlci8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvY2FuY2VsL0NhbmNlbC5qcyIsIndlYnBhY2s6Ly9tb21vdHJhY2tlci8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvY2FuY2VsL0NhbmNlbFRva2VuLmpzIiwid2VicGFjazovL21vbW90cmFja2VyLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jYW5jZWwvaXNDYW5jZWwuanMiLCJ3ZWJwYWNrOi8vbW9tb3RyYWNrZXIvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvQXhpb3MuanMiLCJ3ZWJwYWNrOi8vbW9tb3RyYWNrZXIvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvSW50ZXJjZXB0b3JNYW5hZ2VyLmpzIiwid2VicGFjazovL21vbW90cmFja2VyLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jb3JlL2J1aWxkRnVsbFBhdGguanMiLCJ3ZWJwYWNrOi8vbW9tb3RyYWNrZXIvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvY3JlYXRlRXJyb3IuanMiLCJ3ZWJwYWNrOi8vbW9tb3RyYWNrZXIvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvZGlzcGF0Y2hSZXF1ZXN0LmpzIiwid2VicGFjazovL21vbW90cmFja2VyLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jb3JlL2VuaGFuY2VFcnJvci5qcyIsIndlYnBhY2s6Ly9tb21vdHJhY2tlci8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvY29yZS9tZXJnZUNvbmZpZy5qcyIsIndlYnBhY2s6Ly9tb21vdHJhY2tlci8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvY29yZS9zZXR0bGUuanMiLCJ3ZWJwYWNrOi8vbW9tb3RyYWNrZXIvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvdHJhbnNmb3JtRGF0YS5qcyIsIndlYnBhY2s6Ly9tb21vdHJhY2tlci8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvZGVmYXVsdHMuanMiLCJ3ZWJwYWNrOi8vbW9tb3RyYWNrZXIvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvYmluZC5qcyIsIndlYnBhY2s6Ly9tb21vdHJhY2tlci8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9idWlsZFVSTC5qcyIsIndlYnBhY2s6Ly9tb21vdHJhY2tlci8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9jb21iaW5lVVJMcy5qcyIsIndlYnBhY2s6Ly9tb21vdHJhY2tlci8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9jb29raWVzLmpzIiwid2VicGFjazovL21vbW90cmFja2VyLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL2lzQWJzb2x1dGVVUkwuanMiLCJ3ZWJwYWNrOi8vbW9tb3RyYWNrZXIvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvaXNVUkxTYW1lT3JpZ2luLmpzIiwid2VicGFjazovL21vbW90cmFja2VyLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL25vcm1hbGl6ZUhlYWRlck5hbWUuanMiLCJ3ZWJwYWNrOi8vbW9tb3RyYWNrZXIvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvcGFyc2VIZWFkZXJzLmpzIiwid2VicGFjazovL21vbW90cmFja2VyLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL3NwcmVhZC5qcyIsIndlYnBhY2s6Ly9tb21vdHJhY2tlci8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvdXRpbHMuanMiLCJ3ZWJwYWNrOi8vbW9tb3RyYWNrZXIvLi9yZXNvdXJjZXMvc2Nzcy9zY3NzLnNjc3MiLCJ3ZWJwYWNrOi8vbW9tb3RyYWNrZXIvLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L3J1bnRpbWUvYXBpLmpzIiwid2VicGFjazovL21vbW90cmFja2VyLy4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvZGlzdC9ydW50aW1lL2Nzc1dpdGhNYXBwaW5nVG9TdHJpbmcuanMiLCJ3ZWJwYWNrOi8vbW9tb3RyYWNrZXIvLi9yZXNvdXJjZXMvc2Nzcy9zY3NzLnNjc3M/NmY4MSIsIndlYnBhY2s6Ly9tb21vdHJhY2tlci8uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL2luamVjdFN0eWxlc0ludG9TdHlsZVRhZy5qcyIsIndlYnBhY2s6Ly9tb21vdHJhY2tlci8uL3Jlc291cmNlcy9qcy9jdXN0b21lci9jYXJ0LmpzIiwid2VicGFjazovL21vbW90cmFja2VyL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL21vbW90cmFja2VyL3dlYnBhY2svcnVudGltZS9jb21wYXQgZ2V0IGRlZmF1bHQgZXhwb3J0Iiwid2VicGFjazovL21vbW90cmFja2VyL3dlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsIndlYnBhY2s6Ly9tb21vdHJhY2tlci93ZWJwYWNrL3J1bnRpbWUvaGFzT3duUHJvcGVydHkgc2hvcnRoYW5kIiwid2VicGFjazovL21vbW90cmFja2VyL3dlYnBhY2svcnVudGltZS9tYWtlIG5hbWVzcGFjZSBvYmplY3QiLCJ3ZWJwYWNrOi8vbW9tb3RyYWNrZXIvd2VicGFjay9zdGFydHVwIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQUFBLDRGQUF1QyxDOzs7Ozs7Ozs7OztBQ0ExQjs7QUFFYixZQUFZLG1CQUFPLENBQUMscURBQVk7QUFDaEMsYUFBYSxtQkFBTyxDQUFDLGlFQUFrQjtBQUN2QyxjQUFjLG1CQUFPLENBQUMseUVBQXNCO0FBQzVDLGVBQWUsbUJBQU8sQ0FBQywyRUFBdUI7QUFDOUMsb0JBQW9CLG1CQUFPLENBQUMsNkVBQXVCO0FBQ25ELG1CQUFtQixtQkFBTyxDQUFDLG1GQUEyQjtBQUN0RCxzQkFBc0IsbUJBQU8sQ0FBQyx5RkFBOEI7QUFDNUQsa0JBQWtCLG1CQUFPLENBQUMseUVBQXFCOztBQUUvQztBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLDRDQUE0QztBQUM1Qzs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDRDQUE0QztBQUM1Qzs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLEdBQUc7QUFDSDs7Ozs7Ozs7Ozs7O0FDekxhOztBQUViLFlBQVksbUJBQU8sQ0FBQyxrREFBUztBQUM3QixXQUFXLG1CQUFPLENBQUMsZ0VBQWdCO0FBQ25DLFlBQVksbUJBQU8sQ0FBQyw0REFBYztBQUNsQyxrQkFBa0IsbUJBQU8sQ0FBQyx3RUFBb0I7QUFDOUMsZUFBZSxtQkFBTyxDQUFDLHdEQUFZOztBQUVuQztBQUNBO0FBQ0E7QUFDQSxXQUFXLE9BQU87QUFDbEIsWUFBWSxNQUFNO0FBQ2xCO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLGVBQWUsbUJBQU8sQ0FBQyxrRUFBaUI7QUFDeEMsb0JBQW9CLG1CQUFPLENBQUMsNEVBQXNCO0FBQ2xELGlCQUFpQixtQkFBTyxDQUFDLHNFQUFtQjs7QUFFNUM7QUFDQTtBQUNBO0FBQ0E7QUFDQSxlQUFlLG1CQUFPLENBQUMsb0VBQWtCOztBQUV6Qzs7QUFFQTtBQUNBLHNCQUFzQjs7Ozs7Ozs7Ozs7O0FDcERUOztBQUViO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVyxRQUFRO0FBQ25CO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTs7Ozs7Ozs7Ozs7O0FDbEJhOztBQUViLGFBQWEsbUJBQU8sQ0FBQywyREFBVTs7QUFFL0I7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXLFNBQVM7QUFDcEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxHQUFHOztBQUVIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsR0FBRztBQUNIOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOzs7Ozs7Ozs7Ozs7QUN4RGE7O0FBRWI7QUFDQTtBQUNBOzs7Ozs7Ozs7Ozs7QUNKYTs7QUFFYixZQUFZLG1CQUFPLENBQUMscURBQVk7QUFDaEMsZUFBZSxtQkFBTyxDQUFDLHlFQUFxQjtBQUM1Qyx5QkFBeUIsbUJBQU8sQ0FBQyxpRkFBc0I7QUFDdkQsc0JBQXNCLG1CQUFPLENBQUMsMkVBQW1CO0FBQ2pELGtCQUFrQixtQkFBTyxDQUFDLG1FQUFlOztBQUV6QztBQUNBO0FBQ0E7QUFDQSxXQUFXLE9BQU87QUFDbEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxXQUFXLE9BQU87QUFDbEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQSxHQUFHO0FBQ0g7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLEdBQUc7O0FBRUg7QUFDQTtBQUNBLEdBQUc7O0FBRUg7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxnREFBZ0Q7QUFDaEQ7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBLENBQUM7O0FBRUQ7QUFDQTtBQUNBO0FBQ0EsZ0RBQWdEO0FBQ2hEO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBLENBQUM7O0FBRUQ7Ozs7Ozs7Ozs7OztBQzdGYTs7QUFFYixZQUFZLG1CQUFPLENBQUMscURBQVk7O0FBRWhDO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxXQUFXLFNBQVM7QUFDcEIsV0FBVyxTQUFTO0FBQ3BCO0FBQ0EsWUFBWSxPQUFPO0FBQ25CO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxXQUFXLE9BQU87QUFDbEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsU0FBUztBQUNwQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7O0FBRUE7Ozs7Ozs7Ozs7OztBQ25EYTs7QUFFYixvQkFBb0IsbUJBQU8sQ0FBQyxtRkFBMEI7QUFDdEQsa0JBQWtCLG1CQUFPLENBQUMsK0VBQXdCOztBQUVsRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVyxPQUFPO0FBQ2xCLFdBQVcsT0FBTztBQUNsQixhQUFhLE9BQU87QUFDcEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7OztBQ25CYTs7QUFFYixtQkFBbUIsbUJBQU8sQ0FBQyxxRUFBZ0I7O0FBRTNDO0FBQ0E7QUFDQTtBQUNBLFdBQVcsT0FBTztBQUNsQixXQUFXLE9BQU87QUFDbEIsV0FBVyxPQUFPO0FBQ2xCLFdBQVcsT0FBTztBQUNsQixXQUFXLE9BQU87QUFDbEIsYUFBYSxNQUFNO0FBQ25CO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7OztBQ2pCYTs7QUFFYixZQUFZLG1CQUFPLENBQUMscURBQVk7QUFDaEMsb0JBQW9CLG1CQUFPLENBQUMsdUVBQWlCO0FBQzdDLGVBQWUsbUJBQU8sQ0FBQyx1RUFBb0I7QUFDM0MsZUFBZSxtQkFBTyxDQUFDLHlEQUFhOztBQUVwQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsT0FBTztBQUNsQixhQUFhLFFBQVE7QUFDckI7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSwrQkFBK0I7QUFDL0IsdUNBQXVDO0FBQ3ZDO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EsR0FBRztBQUNIOzs7Ozs7Ozs7Ozs7QUM5RWE7O0FBRWI7QUFDQTtBQUNBO0FBQ0EsV0FBVyxNQUFNO0FBQ2pCLFdBQVcsT0FBTztBQUNsQixXQUFXLE9BQU87QUFDbEIsV0FBVyxPQUFPO0FBQ2xCLFdBQVcsT0FBTztBQUNsQixhQUFhLE1BQU07QUFDbkI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7Ozs7QUN6Q2E7O0FBRWIsWUFBWSxtQkFBTyxDQUFDLG1EQUFVOztBQUU5QjtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsT0FBTztBQUNsQixXQUFXLE9BQU87QUFDbEIsYUFBYSxPQUFPO0FBQ3BCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMLDJCQUEyQjtBQUMzQixLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7O0FBRUg7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQSxHQUFHOztBQUVIO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0EsR0FBRzs7QUFFSDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSzs7QUFFTDs7QUFFQTtBQUNBOzs7Ozs7Ozs7Ozs7QUN0RmE7O0FBRWIsa0JBQWtCLG1CQUFPLENBQUMsbUVBQWU7O0FBRXpDO0FBQ0E7QUFDQTtBQUNBLFdBQVcsU0FBUztBQUNwQixXQUFXLFNBQVM7QUFDcEIsV0FBVyxPQUFPO0FBQ2xCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7Ozs7QUN4QmE7O0FBRWIsWUFBWSxtQkFBTyxDQUFDLHFEQUFZOztBQUVoQztBQUNBO0FBQ0E7QUFDQSxXQUFXLGNBQWM7QUFDekIsV0FBVyxNQUFNO0FBQ2pCLFdBQVcsZUFBZTtBQUMxQixhQUFhLEVBQUU7QUFDZjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRzs7QUFFSDtBQUNBOzs7Ozs7Ozs7Ozs7QUNuQmE7O0FBRWIsWUFBWSxtQkFBTyxDQUFDLGtEQUFTO0FBQzdCLDBCQUEwQixtQkFBTyxDQUFDLDhGQUErQjs7QUFFakU7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxjQUFjLG1CQUFPLENBQUMsZ0VBQWdCO0FBQ3RDLEdBQUc7QUFDSDtBQUNBLGNBQWMsbUJBQU8sQ0FBQyxpRUFBaUI7QUFDdkM7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx3RUFBd0U7QUFDeEU7QUFDQTtBQUNBO0FBQ0EsdURBQXVEO0FBQ3ZEO0FBQ0E7QUFDQTtBQUNBLEdBQUc7O0FBRUg7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU8sWUFBWTtBQUNuQjtBQUNBO0FBQ0EsR0FBRzs7QUFFSDtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxDQUFDOztBQUVEO0FBQ0E7QUFDQSxDQUFDOztBQUVEOzs7Ozs7Ozs7Ozs7QUNqR2E7O0FBRWI7QUFDQTtBQUNBO0FBQ0EsbUJBQW1CLGlCQUFpQjtBQUNwQztBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7Ozs7QUNWYTs7QUFFYixZQUFZLG1CQUFPLENBQUMscURBQVk7O0FBRWhDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxXQUFXLE9BQU87QUFDbEIsV0FBVyxPQUFPO0FBQ2xCLGFBQWEsT0FBTztBQUNwQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0EsR0FBRztBQUNIOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQLEtBQUs7O0FBRUw7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7Ozs7Ozs7Ozs7O0FDckVhOztBQUViO0FBQ0E7QUFDQTtBQUNBLFdBQVcsT0FBTztBQUNsQixXQUFXLE9BQU87QUFDbEIsYUFBYSxPQUFPO0FBQ3BCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7Ozs7O0FDYmE7O0FBRWIsWUFBWSxtQkFBTyxDQUFDLHFEQUFZOztBQUVoQztBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUEsMENBQTBDO0FBQzFDLFNBQVM7O0FBRVQ7QUFDQSw0REFBNEQsd0JBQXdCO0FBQ3BGO0FBQ0EsU0FBUzs7QUFFVDtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7O0FBRUw7QUFDQTtBQUNBO0FBQ0Esa0NBQWtDO0FBQ2xDLCtCQUErQixhQUFhLEVBQUU7QUFDOUM7QUFDQTtBQUNBLEtBQUs7QUFDTDs7Ozs7Ozs7Ozs7O0FDcERhOztBQUViO0FBQ0E7QUFDQTtBQUNBLFdBQVcsT0FBTztBQUNsQixhQUFhLFFBQVE7QUFDckI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7OztBQ2JhOztBQUViLFlBQVksbUJBQU8sQ0FBQyxxREFBWTs7QUFFaEM7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsY0FBYyxPQUFPO0FBQ3JCLGdCQUFnQjtBQUNoQjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLGNBQWMsT0FBTztBQUNyQixnQkFBZ0IsUUFBUTtBQUN4QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLOztBQUVMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7Ozs7Ozs7Ozs7OztBQ25FYTs7QUFFYixZQUFZLG1CQUFPLENBQUMsbURBQVU7O0FBRTlCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDs7Ozs7Ozs7Ozs7O0FDWGE7O0FBRWIsWUFBWSxtQkFBTyxDQUFDLHFEQUFZOztBQUVoQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVyxPQUFPO0FBQ2xCLGFBQWEsT0FBTztBQUNwQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsaUJBQWlCLGVBQWU7O0FBRWhDO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQSxHQUFHOztBQUVIO0FBQ0E7Ozs7Ozs7Ozs7OztBQ3BEYTs7QUFFYjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsK0JBQStCO0FBQy9CO0FBQ0E7QUFDQSxXQUFXLFNBQVM7QUFDcEIsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7Ozs7O0FDMUJhOztBQUViLFdBQVcsbUJBQU8sQ0FBQyxnRUFBZ0I7O0FBRW5DOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsT0FBTztBQUNsQixhQUFhLFFBQVE7QUFDckI7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsV0FBVyxPQUFPO0FBQ2xCLGFBQWEsUUFBUTtBQUNyQjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxXQUFXLE9BQU87QUFDbEIsYUFBYSxRQUFRO0FBQ3JCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsV0FBVyxPQUFPO0FBQ2xCLGFBQWEsUUFBUTtBQUNyQjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxXQUFXLE9BQU87QUFDbEIsYUFBYSxRQUFRO0FBQ3JCO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsT0FBTztBQUNsQixhQUFhLFFBQVE7QUFDckI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxXQUFXLE9BQU87QUFDbEIsYUFBYSxRQUFRO0FBQ3JCO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsT0FBTztBQUNsQixhQUFhLFFBQVE7QUFDckI7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsV0FBVyxPQUFPO0FBQ2xCLGFBQWEsUUFBUTtBQUNyQjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxXQUFXLE9BQU87QUFDbEIsWUFBWSxRQUFRO0FBQ3BCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsT0FBTztBQUNsQixhQUFhLFFBQVE7QUFDckI7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsV0FBVyxPQUFPO0FBQ2xCLGFBQWEsUUFBUTtBQUNyQjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxXQUFXLE9BQU87QUFDbEIsYUFBYSxRQUFRO0FBQ3JCO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsT0FBTztBQUNsQixhQUFhLFFBQVE7QUFDckI7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsV0FBVyxPQUFPO0FBQ2xCLGFBQWEsUUFBUTtBQUNyQjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxXQUFXLE9BQU87QUFDbEIsYUFBYSxRQUFRO0FBQ3JCO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsT0FBTztBQUNsQixhQUFhLE9BQU87QUFDcEI7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXLGFBQWE7QUFDeEIsV0FBVyxTQUFTO0FBQ3BCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxtQ0FBbUMsT0FBTztBQUMxQztBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx1QkFBdUIsU0FBUyxHQUFHLFNBQVM7QUFDNUMsMkJBQTJCO0FBQzNCO0FBQ0E7QUFDQSxXQUFXLE9BQU87QUFDbEIsYUFBYSxPQUFPO0FBQ3BCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTCw0QkFBNEI7QUFDNUIsS0FBSztBQUNMO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTs7QUFFQSx1Q0FBdUMsT0FBTztBQUM5QztBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxXQUFXLE9BQU87QUFDbEIsV0FBVyxPQUFPO0FBQ2xCLFdBQVcsT0FBTztBQUNsQixZQUFZLE9BQU87QUFDbkI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsV0FBVyxPQUFPO0FBQ2xCLFlBQVksT0FBTztBQUNuQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDOVZBO0FBQ3lIO0FBQzdCO0FBQzVGLDhCQUE4QixtRkFBMkIsQ0FBQyx3R0FBcUM7QUFDL0Y7QUFDQSwyVUFBMlUsb0JBQW9CLGNBQWMsZUFBZSxxQkFBcUIseUNBQXlDLGdDQUFnQyxpREFBaUQsb0JBQW9CLDRCQUE0QixtQkFBbUIsR0FBRyx1QkFBdUIsV0FBVyxhQUFhLGVBQWUsR0FBRywyQkFBMkIsY0FBYyxlQUFlLGlCQUFpQixHQUFHLDZCQUE2QixZQUFZLGNBQWMsaUJBQWlCLHNFQUFzRSxHQUFHLDRCQUE0QixjQUFjLGdCQUFnQixpQkFBaUIsR0FBRywwQkFBMEIsY0FBYyxhQUFhLGVBQWUsR0FBRyw4QkFBOEIsaUJBQWlCLGVBQWUsaUJBQWlCLEdBQUcsZ0NBQWdDLGVBQWUsY0FBYyxpQkFBaUIsc0VBQXNFLEdBQUcsK0JBQStCLGlCQUFpQixnQkFBZ0IsaUJBQWlCLEdBQUcsMEJBQTBCLGFBQWEsY0FBYyxpQkFBaUIseUZBQXlGLEdBQUcsOEJBQThCLGFBQWEsZUFBZSxpQkFBaUIseUVBQXlFLEdBQUcsK0JBQStCLGFBQWEsZ0JBQWdCLGlCQUFpQix5RUFBeUUsR0FBRyx1QkFBdUIsa0JBQWtCLEdBQUcsOERBQThELG1CQUFtQix1QkFBdUIsWUFBWSxjQUFjLGdCQUFnQixnQkFBZ0IsOEJBQThCLGlCQUFpQiw4QkFBOEIsR0FBRyxlQUFlLHdDQUF3QyxpRUFBaUUsMkNBQTJDLGlEQUFpRCxxQkFBcUIsR0FBRyx3QkFBd0IsZUFBZSw4QkFBOEIsd0VBQXdFLGtDQUFrQyxHQUFHLHlCQUF5Qix5RUFBeUUsa0NBQWtDLEdBQUcsOEJBQThCLDhDQUE4QyxHQUFHLDRCQUE0QixvQkFBb0IsR0FBRyx3QkFBd0IsdUJBQXVCLGFBQWEsZUFBZSxzQkFBc0IsZ0JBQWdCLGlCQUFpQix1QkFBdUIsc0JBQXNCLDBDQUEwQyx1QkFBdUIsb0JBQW9CLGtDQUFrQyxHQUFHLDhCQUE4Qix5Q0FBeUMsR0FBRyxpQkFBaUIsb0JBQW9CLGdCQUFnQixpQkFBaUIsMkJBQTJCLG1CQUFtQixpQkFBaUIsWUFBWSxXQUFXLEdBQUcsaUNBQWlDLGVBQWUsMkNBQTJDLEdBQUcsa0NBQWtDLDRDQUE0QyxrQ0FBa0MsR0FBRyw4QkFBOEIsVUFBVSxtQkFBbUIsS0FBSyxHQUFHLDZCQUE2QixVQUFVLGlCQUFpQixLQUFLLEdBQUcsNkJBQTZCLFVBQVUsaUJBQWlCLEtBQUssR0FBRywyQkFBMkIsVUFBVSw4QkFBOEIsaUJBQWlCLEtBQUssR0FBRyw0QkFBNEIsVUFBVSxnQ0FBZ0MsaUJBQWlCLEtBQUssR0FBRywrQkFBK0IsVUFBVSxnQkFBZ0IsS0FBSyxHQUFHLDhCQUE4QixrQkFBa0IscUJBQXFCLHVCQUF1Qix1QkFBdUIsR0FBRyx5Q0FBeUMsa0JBQWtCLG9CQUFvQixHQUFHLDRDQUE0QyxrQkFBa0IsR0FBRyxvRkFBb0YsMkJBQTJCLHFDQUFxQyxtQkFBbUIsR0FBRywwQ0FBMEMsOEJBQThCLHFDQUFxQyxnQkFBZ0IsR0FBRyx3Q0FBd0MsOEJBQThCLHFDQUFxQyxnQkFBZ0IsR0FBRyxrRkFBa0YsOEJBQThCLHFDQUFxQyxnQkFBZ0IsR0FBRywwQ0FBMEMsOEJBQThCLHFDQUFxQyxnQkFBZ0IsR0FBRyxPQUFPLGNBQWMsR0FBRyxpQkFBaUIsaUJBQWlCLGdCQUFnQixHQUFHLGtCQUFrQixrQkFBa0IsR0FBRyxVQUFVLDBDQUEwQyx3Q0FBd0MsbUJBQW1CLGdCQUFnQixHQUFHLFNBQVMsdUJBQXVCLHNCQUFzQixHQUFHLGtCQUFrQiwwQkFBMEIsa0JBQWtCLHVCQUF1QixhQUFhLGNBQWMsR0FBRyx3QkFBd0IsMEJBQTBCLG1CQUFtQixpQkFBaUIsb0JBQW9CLEdBQUcsbUNBQW1DLHVCQUF1QixHQUFHLG9CQUFvQix1QkFBdUIsd0JBQXdCLGlCQUFpQixnQkFBZ0IsaUJBQWlCLHVCQUF1QiwyQkFBMkIsb0JBQW9CLHNCQUFzQixjQUFjLGdCQUFnQixHQUFHLDBCQUEwQixtQkFBbUIsMEJBQTBCLEdBQUcsV0FBVyxnQkFBZ0IsaUJBQWlCLEdBQUcsbUJBQW1CLHVCQUF1QixZQUFZLGFBQWEsMEJBQTBCLEdBQUcsdUJBQXVCLGlCQUFpQixrQkFBa0IsR0FBRyx3QkFBd0IsdUJBQXVCLGFBQWEsZUFBZSx3QkFBd0IsbUJBQW1CLG9CQUFvQixxQkFBcUIsR0FBRyxzQkFBc0IsdUJBQXVCLGdCQUFnQixnQkFBZ0Isd0JBQXdCLFlBQVksR0FBRyxhQUFhLHVCQUF1QixjQUFjLGFBQWEsZUFBZSxnQkFBZ0IsR0FBRyxjQUFjLG9CQUFvQix3QkFBd0Isa0JBQWtCLHVCQUF1QixhQUFhLGFBQWEsR0FBRyxpQkFBaUIsbUJBQW1CLG9CQUFvQix3QkFBd0IsbUJBQW1CLEdBQUcsWUFBWSx3QkFBd0IsZ0JBQWdCLGlCQUFpQiw0QkFBNEIsdUJBQXVCLDBCQUEwQixlQUFlLG1CQUFtQix1QkFBdUIsR0FBRyxrQkFBa0IsOEJBQThCLGdCQUFnQixHQUFHLGdDQUFnQyxtQkFBbUIsR0FBRyxxQkFBcUIsaUJBQWlCLHVCQUF1QixnQkFBZ0IsR0FBRyx3QkFBd0Isb0JBQW9CLGlCQUFpQixzQkFBc0IsbUJBQW1CLHdCQUF3QixHQUFHLG9CQUFvQixlQUFlLGdCQUFnQixtQkFBbUIsaUJBQWlCLEdBQUcsMkJBQTJCLG1CQUFtQix1QkFBdUIscUJBQXFCLHdCQUF3QixvQkFBb0IsbUJBQW1CLGtCQUFrQixHQUFHLDRCQUE0QiwwQkFBMEIsZUFBZSxxQkFBcUIsaUJBQWlCLHVCQUF1QixxQkFBcUIsbUJBQW1CLEdBQUcsdUJBQXVCLHdCQUF3QixnQkFBZ0IsdUJBQXVCLGlCQUFpQiw0QkFBNEIsdUJBQXVCLHNCQUFzQixHQUFHLDZCQUE2QixrQkFBa0IsR0FBRyx1Q0FBdUMsbUJBQW1CLHVCQUF1QixxQkFBcUIsb0JBQW9CLG1CQUFtQix3QkFBd0IsR0FBRyxtQkFBbUIsb0JBQW9CLGlCQUFpQix1QkFBdUIsaUJBQWlCLEdBQUcsa0JBQWtCLGVBQWUsaUJBQWlCLEdBQUcsc0JBQXNCLGdCQUFnQixpQkFBaUIsR0FBRyxtQkFBbUIsd0JBQXdCLGdCQUFnQixpQkFBaUIsNEJBQTRCLHVCQUF1QiwwQkFBMEIsaUJBQWlCLHNCQUFzQixtQkFBbUIsdUJBQXVCLEdBQUcseUJBQXlCLDhCQUE4QixnQkFBZ0IsR0FBRyxvQkFBb0Isd0JBQXdCLHFCQUFxQixHQUFHLHdCQUF3QixlQUFlLGlCQUFpQixHQUFHLHVCQUF1QixvQkFBb0Isa0JBQWtCLHFCQUFxQix3QkFBd0IsR0FBRyxjQUFjLHlCQUF5QixrQ0FBa0MsR0FBRyx3QkFBd0IsZUFBZSxtQkFBbUIsaUJBQWlCLEdBQUcsaUJBQWlCLG1CQUFtQixnQkFBZ0IsdUJBQXVCLG9CQUFvQixtQkFBbUIsR0FBRyxpQkFBaUIsbUJBQW1CLGdCQUFnQix1QkFBdUIsb0JBQW9CLGdCQUFnQixHQUFHLGlDQUFpQyxtQkFBbUIsZ0JBQWdCLHVCQUF1Qix1QkFBdUIsb0JBQW9CLG1CQUFtQixHQUFHLFlBQVksa0JBQWtCLHNCQUFzQixHQUFHLGlCQUFpQixtQkFBbUIsbUJBQW1CLEdBQUcsY0FBYyxtQkFBbUIsc0JBQXNCLHVCQUF1QixHQUFHLG9CQUFvQixlQUFlLGlCQUFpQix1QkFBdUIsa0JBQWtCLGFBQWEsMkJBQTJCLHVCQUF1QixHQUFHLHFCQUFxQix3QkFBd0IsZ0JBQWdCLHdCQUF3QixpQkFBaUIsb0JBQW9CLDJCQUEyQix1QkFBdUIsY0FBYyxhQUFhLEdBQUcsMkNBQTJDLHdCQUF3QixHQUFHLHVEQUF1RCxzQkFBc0IsR0FBRyxtQkFBbUIsd0JBQXdCLGdCQUFnQixvQkFBb0Isa0JBQWtCLHdCQUF3QiwyQkFBMkIsR0FBRyx5QkFBeUIsc0JBQXNCLEdBQUcsZ0JBQWdCLG1CQUFtQixxQkFBcUIsR0FBRyxzQkFBc0IsbUJBQW1CLEdBQUcsaUJBQWlCLGVBQWUsb0JBQW9CLGtCQUFrQix1QkFBdUIsR0FBRyxxQkFBcUIsb0JBQW9CLHFCQUFxQix1QkFBdUIsYUFBYSxjQUFjLGtCQUFrQixHQUFHLHdCQUF3QixlQUFlLHFCQUFxQixvQkFBb0Isa0JBQWtCLHVCQUF1QixHQUFHLDBCQUEwQixnQkFBZ0IsK0JBQStCLDBCQUEwQixtQkFBbUIsR0FBRyxrQkFBa0IsaUJBQWlCLDJCQUEyQixHQUFHLHNCQUFzQixnQ0FBZ0MsdUJBQXVCLEdBQUcsZ0JBQWdCLGlCQUFpQiw0QkFBNEIsR0FBRyxvQkFBb0IsdUJBQXVCLGlCQUFpQixnQ0FBZ0Msa0NBQWtDLEdBQUcsc0JBQXNCLFNBQVMsK0JBQStCLEtBQUssU0FBUyxnQ0FBZ0MsS0FBSyxHQUFHLG9CQUFvQix3QkFBd0IsZ0JBQWdCLGtCQUFrQixHQUFHLHVCQUF1QixlQUFlLHNCQUFzQix1QkFBdUIsa0JBQWtCLEdBQUcsaUJBQWlCLHVCQUF1QixHQUFHLG9CQUFvQixxQkFBcUIsdUJBQXVCLEdBQUcsMkJBQTJCLHVCQUF1QixhQUFhLGtCQUFrQixHQUFHLG1CQUFtQixpQkFBaUIsdUJBQXVCLGNBQWMsWUFBWSxHQUFHLHNCQUFzQixpQkFBaUIsaUJBQWlCLG9CQUFvQix1QkFBdUIsMEJBQTBCLEdBQUcsNEJBQTRCLG9CQUFvQix1QkFBdUIsYUFBYSxjQUFjLGtDQUFrQywwQkFBMEIsR0FBRyxtQkFBbUIsa0JBQWtCLEdBQUcsNkJBQTZCLGtCQUFrQixzQkFBc0IsdUJBQXVCLGdCQUFnQixpQkFBaUIsZ0JBQWdCLGFBQWEsdUJBQXVCLEdBQUcsNEJBQTRCLGtCQUFrQixzQkFBc0IsZUFBZSxpQkFBaUIscUJBQXFCLGdCQUFnQixjQUFjLHVCQUF1QixHQUFHLDBDQUEwQyw0QkFBNEIseUJBQXlCLEtBQUssZUFBZSxnQkFBZ0IsZUFBZSxpQkFBaUIsb0JBQW9CLEtBQUsscUJBQXFCLGdCQUFnQixjQUFjLGtCQUFrQixjQUFjLEtBQUssbUJBQW1CLG9CQUFvQixLQUFLLHNCQUFzQix1QkFBdUIsc0JBQXNCLEtBQUssNkJBQTZCLHVCQUF1QixzQkFBc0IsS0FBSyx5QkFBeUIsd0JBQXdCLEtBQUssd0JBQXdCLHNCQUFzQixtQkFBbUIsS0FBSywyQkFBMkIsb0JBQW9CLEtBQUsseUJBQXlCLGtCQUFrQixLQUFLLHFCQUFxQixxQkFBcUIsS0FBSyxzQkFBc0Isc0JBQXNCLEtBQUssZUFBZSxvQkFBb0IsS0FBSyxtQkFBbUIsc0JBQXNCLEtBQUssZ0JBQWdCLHNCQUFzQixlQUFlLGVBQWUsS0FBSyxjQUFjLGlCQUFpQixLQUFLLG1CQUFtQixzQkFBc0IsS0FBSyx3QkFBd0Isa0JBQWtCLEtBQUssMEJBQTBCLHNCQUFzQixLQUFLLHNCQUFzQixtQkFBbUIsS0FBSyw2QkFBNkIsc0JBQXNCLEtBQUsseUJBQXlCLGtCQUFrQixzQkFBc0Isb0JBQW9CLEtBQUsscUJBQXFCLHVCQUF1Qix5QkFBeUIscUJBQXFCLEtBQUssMEJBQTBCLHVCQUF1QixLQUFLLG9CQUFvQixxQkFBcUIseUJBQXlCLHVCQUF1QixLQUFLLHlCQUF5QixzQkFBc0IsS0FBSywwQkFBMEIsc0JBQXNCLGlCQUFpQixLQUFLLDZEQUE2RCxzQkFBc0IsS0FBSyxzQkFBc0Isb0JBQW9CLEtBQUssb0JBQW9CLHNCQUFzQixLQUFLLHlEQUF5RCxtQkFBbUIsc0JBQXNCLHdCQUF3QixLQUFLLHFCQUFxQixzQkFBc0IsS0FBSyxzQkFBc0IsaUJBQWlCLEtBQUssdUJBQXVCLHNCQUFzQixLQUFLLHVCQUF1QixzQkFBc0IsY0FBYyxLQUFLLHFCQUFxQixzQkFBc0IsS0FBSyxzQkFBc0Isc0JBQXNCLEtBQUsscUJBQXFCLHNCQUFzQixLQUFLLGtCQUFrQixzQkFBc0IsS0FBSyxHQUFHLE9BQU8sMk9BQTJPLFVBQVUsVUFBVSxVQUFVLFdBQVcsV0FBVyxXQUFXLFdBQVcsVUFBVSxXQUFXLFVBQVUsTUFBTSxLQUFLLFVBQVUsVUFBVSxVQUFVLE1BQU0sS0FBSyxZQUFZLGNBQWMsY0FBYyxRQUFRLEtBQUssVUFBVSxVQUFVLFlBQVksYUFBYSxNQUFNLEtBQUssWUFBWSxjQUFjLGNBQWMsUUFBUSxLQUFLLFVBQVUsVUFBVSxVQUFVLE1BQU0sS0FBSyxZQUFZLGNBQWMsY0FBYyxRQUFRLEtBQUssVUFBVSxVQUFVLFlBQVksYUFBYSxNQUFNLEtBQUssWUFBWSxjQUFjLGNBQWMsUUFBUSxLQUFLLFVBQVUsVUFBVSxZQUFZLGFBQWEsTUFBTSxLQUFLLFVBQVUsWUFBWSxjQUFjLGFBQWEsTUFBTSxNQUFNLFVBQVUsWUFBWSxjQUFjLGFBQWEsTUFBTSxNQUFNLFVBQVUsTUFBTSxNQUFNLFVBQVUsV0FBVyxVQUFVLFVBQVUsVUFBVSxVQUFVLFdBQVcsVUFBVSxXQUFXLE1BQU0sTUFBTSxXQUFXLFdBQVcsV0FBVyxXQUFXLFdBQVcsTUFBTSxNQUFNLFVBQVUsV0FBVyxXQUFXLFdBQVcsTUFBTSxNQUFNLFdBQVcsV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLE1BQU0sVUFBVSxNQUFNLE1BQU0sV0FBVyxVQUFVLFVBQVUsV0FBVyxVQUFVLFVBQVUsV0FBVyxXQUFXLFdBQVcsV0FBVyxVQUFVLFdBQVcsTUFBTSxNQUFNLFdBQVcsTUFBTSxNQUFNLFVBQVUsVUFBVSxVQUFVLFdBQVcsVUFBVSxVQUFVLFVBQVUsVUFBVSxNQUFNLE1BQU0sVUFBVSxXQUFXLE1BQU0sTUFBTSxXQUFXLFdBQVcsTUFBTSxNQUFNLEtBQUssVUFBVSxLQUFLLEtBQUssS0FBSyxLQUFLLFVBQVUsS0FBSyxLQUFLLE1BQU0sS0FBSyxVQUFVLEtBQUssS0FBSyxNQUFNLEtBQUssV0FBVyxVQUFVLEtBQUssS0FBSyxNQUFNLEtBQUssV0FBVyxVQUFVLE1BQU0sS0FBSyxNQUFNLEtBQUssVUFBVSxNQUFNLEtBQUssTUFBTSxVQUFVLFdBQVcsV0FBVyxXQUFXLE1BQU0sTUFBTSxVQUFVLFVBQVUsTUFBTSxNQUFNLFVBQVUsT0FBTyxPQUFPLFdBQVcsV0FBVyxVQUFVLE9BQU8sTUFBTSxXQUFXLFdBQVcsVUFBVSxPQUFPLE1BQU0sV0FBVyxXQUFXLFVBQVUsT0FBTyxPQUFPLFdBQVcsV0FBVyxVQUFVLE9BQU8sTUFBTSxXQUFXLFdBQVcsVUFBVSxPQUFPLE1BQU0sVUFBVSxPQUFPLE9BQU8sVUFBVSxVQUFVLE9BQU8sTUFBTSxVQUFVLE9BQU8sTUFBTSxXQUFXLFdBQVcsVUFBVSxVQUFVLE9BQU8sTUFBTSxXQUFXLFdBQVcsT0FBTyxNQUFNLFdBQVcsVUFBVSxXQUFXLFVBQVUsVUFBVSxPQUFPLE1BQU0sV0FBVyxVQUFVLFVBQVUsVUFBVSxPQUFPLE1BQU0sV0FBVyxPQUFPLE1BQU0sV0FBVyxXQUFXLFVBQVUsVUFBVSxVQUFVLFdBQVcsV0FBVyxVQUFVLFdBQVcsVUFBVSxVQUFVLE9BQU8sTUFBTSxVQUFVLFdBQVcsT0FBTyxNQUFNLFVBQVUsVUFBVSxPQUFPLE1BQU0sV0FBVyxVQUFVLFVBQVUsV0FBVyxPQUFPLE1BQU0sVUFBVSxVQUFVLE9BQU8sTUFBTSxXQUFXLFVBQVUsVUFBVSxXQUFXLFVBQVUsVUFBVSxXQUFXLE9BQU8sTUFBTSxXQUFXLFVBQVUsVUFBVSxXQUFXLFVBQVUsT0FBTyxNQUFNLFdBQVcsVUFBVSxVQUFVLFVBQVUsVUFBVSxPQUFPLE1BQU0sVUFBVSxXQUFXLFVBQVUsV0FBVyxVQUFVLFVBQVUsT0FBTyxNQUFNLFVBQVUsVUFBVSxXQUFXLFVBQVUsT0FBTyxNQUFNLFdBQVcsVUFBVSxVQUFVLFdBQVcsV0FBVyxXQUFXLFVBQVUsVUFBVSxXQUFXLE9BQU8sTUFBTSxZQUFZLFlBQVksT0FBTyxNQUFNLFVBQVUsT0FBTyxNQUFNLFVBQVUsV0FBVyxVQUFVLE9BQU8sTUFBTSxVQUFVLFVBQVUsV0FBVyxXQUFXLFlBQVksT0FBTyxNQUFNLFVBQVUsVUFBVSxVQUFVLFVBQVUsT0FBTyxNQUFNLFVBQVUsV0FBVyxXQUFXLFdBQVcsVUFBVSxVQUFVLFVBQVUsT0FBTyxNQUFNLFdBQVcsVUFBVSxXQUFXLFVBQVUsV0FBVyxXQUFXLFVBQVUsT0FBTyxNQUFNLFdBQVcsVUFBVSxXQUFXLFVBQVUsV0FBVyxXQUFXLFdBQVcsT0FBTyxNQUFNLFVBQVUsT0FBTyxNQUFNLFdBQVcsWUFBWSxXQUFXLFVBQVUsVUFBVSxXQUFXLE9BQU8sTUFBTSxVQUFVLFVBQVUsV0FBVyxVQUFVLE9BQU8sTUFBTSxVQUFVLFVBQVUsT0FBTyxNQUFNLFVBQVUsVUFBVSxPQUFPLE1BQU0sV0FBVyxVQUFVLFVBQVUsV0FBVyxXQUFXLFdBQVcsVUFBVSxXQUFXLFVBQVUsV0FBVyxPQUFPLE1BQU0sWUFBWSxZQUFZLE9BQU8sTUFBTSxZQUFZLFlBQVksT0FBTyxNQUFNLFVBQVUsVUFBVSxPQUFPLE1BQU0sVUFBVSxVQUFVLFdBQVcsV0FBVyxPQUFPLE1BQU0sV0FBVyxXQUFXLE9BQU8sTUFBTSxVQUFVLFVBQVUsVUFBVSxPQUFPLE1BQU0sVUFBVSxVQUFVLFdBQVcsVUFBVSxXQUFXLFFBQVEsTUFBTSxVQUFVLFVBQVUsV0FBVyxVQUFVLFdBQVcsUUFBUSxNQUFNLFVBQVUsVUFBVSxXQUFXLFdBQVcsVUFBVSxXQUFXLFFBQVEsTUFBTSxVQUFVLFdBQVcsT0FBTyxNQUFNLFdBQVcsV0FBVyxPQUFPLE1BQU0sVUFBVSxXQUFXLFdBQVcsT0FBTyxNQUFNLFVBQVUsVUFBVSxXQUFXLFVBQVUsVUFBVSxXQUFXLFdBQVcsT0FBTyxNQUFNLFlBQVksWUFBWSxZQUFZLFVBQVUsVUFBVSxXQUFXLFdBQVcsVUFBVSxVQUFVLE9BQU8sTUFBTSxZQUFZLFFBQVEsTUFBTSxXQUFXLE9BQU8sTUFBTSxZQUFZLFlBQVksV0FBVyxVQUFVLFdBQVcsV0FBVyxPQUFPLE1BQU0sV0FBVyxPQUFPLE1BQU0sV0FBVyxZQUFZLE9BQU8sTUFBTSxXQUFXLFFBQVEsTUFBTSxVQUFVLFVBQVUsVUFBVSxXQUFXLE9BQU8sTUFBTSxVQUFVLFdBQVcsV0FBVyxVQUFVLFVBQVUsVUFBVSxPQUFPLE1BQU0sVUFBVSxXQUFXLFVBQVUsVUFBVSxXQUFXLE9BQU8sTUFBTSxVQUFVLFdBQVcsV0FBVyxVQUFVLE9BQU8sTUFBTSxVQUFVLFdBQVcsT0FBTyxNQUFNLFdBQVcsV0FBVyxPQUFPLE1BQU0sVUFBVSxXQUFXLE9BQU8sTUFBTSxXQUFXLFVBQVUsV0FBVyxXQUFXLE9BQU8sTUFBTSxLQUFLLFdBQVcsTUFBTSxNQUFNLFdBQVcsTUFBTSxLQUFLLE1BQU0sV0FBVyxVQUFVLFVBQVUsT0FBTyxNQUFNLFVBQVUsV0FBVyxXQUFXLFVBQVUsT0FBTyxNQUFNLFdBQVcsT0FBTyxNQUFNLFdBQVcsV0FBVyxPQUFPLE1BQU0sV0FBVyxVQUFVLFVBQVUsT0FBTyxNQUFNLFVBQVUsV0FBVyxVQUFVLFVBQVUsT0FBTyxNQUFNLFVBQVUsVUFBVSxVQUFVLFdBQVcsV0FBVyxPQUFPLE1BQU0sVUFBVSxXQUFXLFVBQVUsVUFBVSxXQUFXLFdBQVcsT0FBTyxNQUFNLFVBQVUsT0FBTyxNQUFNLFVBQVUsV0FBVyxXQUFXLFVBQVUsVUFBVSxVQUFVLFVBQVUsV0FBVyxPQUFPLE1BQU0sVUFBVSxXQUFXLFVBQVUsVUFBVSxXQUFXLFVBQVUsVUFBVSxXQUFXLE9BQU8sTUFBTSxLQUFLLFdBQVcsT0FBTyxNQUFNLFVB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QUFDQTs7QUFFQSxtQkFBbUIsNEJBQTRCO0FBQy9DO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBLG9CQUFvQiw2QkFBNkI7QUFDakQ7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLEU7Ozs7Ozs7Ozs7Ozs7OztBQzVRZ0M7QUFDTjs7QUFFMUI7QUFDQTtBQUNBO0FBQ0EsQ0FBQzs7QUFFRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsRUFBRSxpREFBVSx3QkFBd0IsR0FBRztBQUN2QztBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0wsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMLEdBQUc7QUFDSDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIOzs7Ozs7O1VDeENBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBOztVQUVBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBOzs7OztXQ3JCQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0EsZ0NBQWdDLFlBQVk7V0FDNUM7V0FDQSxFOzs7OztXQ1BBO1dBQ0E7V0FDQTtXQUNBO1dBQ0Esd0NBQXdDLHlDQUF5QztXQUNqRjtXQUNBO1dBQ0EsRTs7Ozs7V0NQQSxzRjs7Ozs7V0NBQTtXQUNBO1dBQ0E7V0FDQSxzREFBc0Qsa0JBQWtCO1dBQ3hFO1dBQ0EsK0NBQStDLGNBQWM7V0FDN0QsRTs7OztVQ05BO1VBQ0E7VUFDQTtVQUNBIiwiZmlsZSI6ImNhcnQuanMiLCJzb3VyY2VzQ29udGVudCI6WyJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vbGliL2F4aW9zJyk7IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG52YXIgc2V0dGxlID0gcmVxdWlyZSgnLi8uLi9jb3JlL3NldHRsZScpO1xudmFyIGNvb2tpZXMgPSByZXF1aXJlKCcuLy4uL2hlbHBlcnMvY29va2llcycpO1xudmFyIGJ1aWxkVVJMID0gcmVxdWlyZSgnLi8uLi9oZWxwZXJzL2J1aWxkVVJMJyk7XG52YXIgYnVpbGRGdWxsUGF0aCA9IHJlcXVpcmUoJy4uL2NvcmUvYnVpbGRGdWxsUGF0aCcpO1xudmFyIHBhcnNlSGVhZGVycyA9IHJlcXVpcmUoJy4vLi4vaGVscGVycy9wYXJzZUhlYWRlcnMnKTtcbnZhciBpc1VSTFNhbWVPcmlnaW4gPSByZXF1aXJlKCcuLy4uL2hlbHBlcnMvaXNVUkxTYW1lT3JpZ2luJyk7XG52YXIgY3JlYXRlRXJyb3IgPSByZXF1aXJlKCcuLi9jb3JlL2NyZWF0ZUVycm9yJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24geGhyQWRhcHRlcihjb25maWcpIHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIGRpc3BhdGNoWGhyUmVxdWVzdChyZXNvbHZlLCByZWplY3QpIHtcbiAgICB2YXIgcmVxdWVzdERhdGEgPSBjb25maWcuZGF0YTtcbiAgICB2YXIgcmVxdWVzdEhlYWRlcnMgPSBjb25maWcuaGVhZGVycztcblxuICAgIGlmICh1dGlscy5pc0Zvcm1EYXRhKHJlcXVlc3REYXRhKSkge1xuICAgICAgZGVsZXRlIHJlcXVlc3RIZWFkZXJzWydDb250ZW50LVR5cGUnXTsgLy8gTGV0IHRoZSBicm93c2VyIHNldCBpdFxuICAgIH1cblxuICAgIGlmIChcbiAgICAgICh1dGlscy5pc0Jsb2IocmVxdWVzdERhdGEpIHx8IHV0aWxzLmlzRmlsZShyZXF1ZXN0RGF0YSkpICYmXG4gICAgICByZXF1ZXN0RGF0YS50eXBlXG4gICAgKSB7XG4gICAgICBkZWxldGUgcmVxdWVzdEhlYWRlcnNbJ0NvbnRlbnQtVHlwZSddOyAvLyBMZXQgdGhlIGJyb3dzZXIgc2V0IGl0XG4gICAgfVxuXG4gICAgdmFyIHJlcXVlc3QgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcblxuICAgIC8vIEhUVFAgYmFzaWMgYXV0aGVudGljYXRpb25cbiAgICBpZiAoY29uZmlnLmF1dGgpIHtcbiAgICAgIHZhciB1c2VybmFtZSA9IGNvbmZpZy5hdXRoLnVzZXJuYW1lIHx8ICcnO1xuICAgICAgdmFyIHBhc3N3b3JkID0gdW5lc2NhcGUoZW5jb2RlVVJJQ29tcG9uZW50KGNvbmZpZy5hdXRoLnBhc3N3b3JkKSkgfHwgJyc7XG4gICAgICByZXF1ZXN0SGVhZGVycy5BdXRob3JpemF0aW9uID0gJ0Jhc2ljICcgKyBidG9hKHVzZXJuYW1lICsgJzonICsgcGFzc3dvcmQpO1xuICAgIH1cblxuICAgIHZhciBmdWxsUGF0aCA9IGJ1aWxkRnVsbFBhdGgoY29uZmlnLmJhc2VVUkwsIGNvbmZpZy51cmwpO1xuICAgIHJlcXVlc3Qub3Blbihjb25maWcubWV0aG9kLnRvVXBwZXJDYXNlKCksIGJ1aWxkVVJMKGZ1bGxQYXRoLCBjb25maWcucGFyYW1zLCBjb25maWcucGFyYW1zU2VyaWFsaXplciksIHRydWUpO1xuXG4gICAgLy8gU2V0IHRoZSByZXF1ZXN0IHRpbWVvdXQgaW4gTVNcbiAgICByZXF1ZXN0LnRpbWVvdXQgPSBjb25maWcudGltZW91dDtcblxuICAgIC8vIExpc3RlbiBmb3IgcmVhZHkgc3RhdGVcbiAgICByZXF1ZXN0Lm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uIGhhbmRsZUxvYWQoKSB7XG4gICAgICBpZiAoIXJlcXVlc3QgfHwgcmVxdWVzdC5yZWFkeVN0YXRlICE9PSA0KSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgLy8gVGhlIHJlcXVlc3QgZXJyb3JlZCBvdXQgYW5kIHdlIGRpZG4ndCBnZXQgYSByZXNwb25zZSwgdGhpcyB3aWxsIGJlXG4gICAgICAvLyBoYW5kbGVkIGJ5IG9uZXJyb3IgaW5zdGVhZFxuICAgICAgLy8gV2l0aCBvbmUgZXhjZXB0aW9uOiByZXF1ZXN0IHRoYXQgdXNpbmcgZmlsZTogcHJvdG9jb2wsIG1vc3QgYnJvd3NlcnNcbiAgICAgIC8vIHdpbGwgcmV0dXJuIHN0YXR1cyBhcyAwIGV2ZW4gdGhvdWdoIGl0J3MgYSBzdWNjZXNzZnVsIHJlcXVlc3RcbiAgICAgIGlmIChyZXF1ZXN0LnN0YXR1cyA9PT0gMCAmJiAhKHJlcXVlc3QucmVzcG9uc2VVUkwgJiYgcmVxdWVzdC5yZXNwb25zZVVSTC5pbmRleE9mKCdmaWxlOicpID09PSAwKSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIC8vIFByZXBhcmUgdGhlIHJlc3BvbnNlXG4gICAgICB2YXIgcmVzcG9uc2VIZWFkZXJzID0gJ2dldEFsbFJlc3BvbnNlSGVhZGVycycgaW4gcmVxdWVzdCA/IHBhcnNlSGVhZGVycyhyZXF1ZXN0LmdldEFsbFJlc3BvbnNlSGVhZGVycygpKSA6IG51bGw7XG4gICAgICB2YXIgcmVzcG9uc2VEYXRhID0gIWNvbmZpZy5yZXNwb25zZVR5cGUgfHwgY29uZmlnLnJlc3BvbnNlVHlwZSA9PT0gJ3RleHQnID8gcmVxdWVzdC5yZXNwb25zZVRleHQgOiByZXF1ZXN0LnJlc3BvbnNlO1xuICAgICAgdmFyIHJlc3BvbnNlID0ge1xuICAgICAgICBkYXRhOiByZXNwb25zZURhdGEsXG4gICAgICAgIHN0YXR1czogcmVxdWVzdC5zdGF0dXMsXG4gICAgICAgIHN0YXR1c1RleHQ6IHJlcXVlc3Quc3RhdHVzVGV4dCxcbiAgICAgICAgaGVhZGVyczogcmVzcG9uc2VIZWFkZXJzLFxuICAgICAgICBjb25maWc6IGNvbmZpZyxcbiAgICAgICAgcmVxdWVzdDogcmVxdWVzdFxuICAgICAgfTtcblxuICAgICAgc2V0dGxlKHJlc29sdmUsIHJlamVjdCwgcmVzcG9uc2UpO1xuXG4gICAgICAvLyBDbGVhbiB1cCByZXF1ZXN0XG4gICAgICByZXF1ZXN0ID0gbnVsbDtcbiAgICB9O1xuXG4gICAgLy8gSGFuZGxlIGJyb3dzZXIgcmVxdWVzdCBjYW5jZWxsYXRpb24gKGFzIG9wcG9zZWQgdG8gYSBtYW51YWwgY2FuY2VsbGF0aW9uKVxuICAgIHJlcXVlc3Qub25hYm9ydCA9IGZ1bmN0aW9uIGhhbmRsZUFib3J0KCkge1xuICAgICAgaWYgKCFyZXF1ZXN0KSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgcmVqZWN0KGNyZWF0ZUVycm9yKCdSZXF1ZXN0IGFib3J0ZWQnLCBjb25maWcsICdFQ09OTkFCT1JURUQnLCByZXF1ZXN0KSk7XG5cbiAgICAgIC8vIENsZWFuIHVwIHJlcXVlc3RcbiAgICAgIHJlcXVlc3QgPSBudWxsO1xuICAgIH07XG5cbiAgICAvLyBIYW5kbGUgbG93IGxldmVsIG5ldHdvcmsgZXJyb3JzXG4gICAgcmVxdWVzdC5vbmVycm9yID0gZnVuY3Rpb24gaGFuZGxlRXJyb3IoKSB7XG4gICAgICAvLyBSZWFsIGVycm9ycyBhcmUgaGlkZGVuIGZyb20gdXMgYnkgdGhlIGJyb3dzZXJcbiAgICAgIC8vIG9uZXJyb3Igc2hvdWxkIG9ubHkgZmlyZSBpZiBpdCdzIGEgbmV0d29yayBlcnJvclxuICAgICAgcmVqZWN0KGNyZWF0ZUVycm9yKCdOZXR3b3JrIEVycm9yJywgY29uZmlnLCBudWxsLCByZXF1ZXN0KSk7XG5cbiAgICAgIC8vIENsZWFuIHVwIHJlcXVlc3RcbiAgICAgIHJlcXVlc3QgPSBudWxsO1xuICAgIH07XG5cbiAgICAvLyBIYW5kbGUgdGltZW91dFxuICAgIHJlcXVlc3Qub250aW1lb3V0ID0gZnVuY3Rpb24gaGFuZGxlVGltZW91dCgpIHtcbiAgICAgIHZhciB0aW1lb3V0RXJyb3JNZXNzYWdlID0gJ3RpbWVvdXQgb2YgJyArIGNvbmZpZy50aW1lb3V0ICsgJ21zIGV4Y2VlZGVkJztcbiAgICAgIGlmIChjb25maWcudGltZW91dEVycm9yTWVzc2FnZSkge1xuICAgICAgICB0aW1lb3V0RXJyb3JNZXNzYWdlID0gY29uZmlnLnRpbWVvdXRFcnJvck1lc3NhZ2U7XG4gICAgICB9XG4gICAgICByZWplY3QoY3JlYXRlRXJyb3IodGltZW91dEVycm9yTWVzc2FnZSwgY29uZmlnLCAnRUNPTk5BQk9SVEVEJyxcbiAgICAgICAgcmVxdWVzdCkpO1xuXG4gICAgICAvLyBDbGVhbiB1cCByZXF1ZXN0XG4gICAgICByZXF1ZXN0ID0gbnVsbDtcbiAgICB9O1xuXG4gICAgLy8gQWRkIHhzcmYgaGVhZGVyXG4gICAgLy8gVGhpcyBpcyBvbmx5IGRvbmUgaWYgcnVubmluZyBpbiBhIHN0YW5kYXJkIGJyb3dzZXIgZW52aXJvbm1lbnQuXG4gICAgLy8gU3BlY2lmaWNhbGx5IG5vdCBpZiB3ZSdyZSBpbiBhIHdlYiB3b3JrZXIsIG9yIHJlYWN0LW5hdGl2ZS5cbiAgICBpZiAodXRpbHMuaXNTdGFuZGFyZEJyb3dzZXJFbnYoKSkge1xuICAgICAgLy8gQWRkIHhzcmYgaGVhZGVyXG4gICAgICB2YXIgeHNyZlZhbHVlID0gKGNvbmZpZy53aXRoQ3JlZGVudGlhbHMgfHwgaXNVUkxTYW1lT3JpZ2luKGZ1bGxQYXRoKSkgJiYgY29uZmlnLnhzcmZDb29raWVOYW1lID9cbiAgICAgICAgY29va2llcy5yZWFkKGNvbmZpZy54c3JmQ29va2llTmFtZSkgOlxuICAgICAgICB1bmRlZmluZWQ7XG5cbiAgICAgIGlmICh4c3JmVmFsdWUpIHtcbiAgICAgICAgcmVxdWVzdEhlYWRlcnNbY29uZmlnLnhzcmZIZWFkZXJOYW1lXSA9IHhzcmZWYWx1ZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBBZGQgaGVhZGVycyB0byB0aGUgcmVxdWVzdFxuICAgIGlmICgnc2V0UmVxdWVzdEhlYWRlcicgaW4gcmVxdWVzdCkge1xuICAgICAgdXRpbHMuZm9yRWFjaChyZXF1ZXN0SGVhZGVycywgZnVuY3Rpb24gc2V0UmVxdWVzdEhlYWRlcih2YWwsIGtleSkge1xuICAgICAgICBpZiAodHlwZW9mIHJlcXVlc3REYXRhID09PSAndW5kZWZpbmVkJyAmJiBrZXkudG9Mb3dlckNhc2UoKSA9PT0gJ2NvbnRlbnQtdHlwZScpIHtcbiAgICAgICAgICAvLyBSZW1vdmUgQ29udGVudC1UeXBlIGlmIGRhdGEgaXMgdW5kZWZpbmVkXG4gICAgICAgICAgZGVsZXRlIHJlcXVlc3RIZWFkZXJzW2tleV07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gT3RoZXJ3aXNlIGFkZCBoZWFkZXIgdG8gdGhlIHJlcXVlc3RcbiAgICAgICAgICByZXF1ZXN0LnNldFJlcXVlc3RIZWFkZXIoa2V5LCB2YWwpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyBBZGQgd2l0aENyZWRlbnRpYWxzIHRvIHJlcXVlc3QgaWYgbmVlZGVkXG4gICAgaWYgKCF1dGlscy5pc1VuZGVmaW5lZChjb25maWcud2l0aENyZWRlbnRpYWxzKSkge1xuICAgICAgcmVxdWVzdC53aXRoQ3JlZGVudGlhbHMgPSAhIWNvbmZpZy53aXRoQ3JlZGVudGlhbHM7XG4gICAgfVxuXG4gICAgLy8gQWRkIHJlc3BvbnNlVHlwZSB0byByZXF1ZXN0IGlmIG5lZWRlZFxuICAgIGlmIChjb25maWcucmVzcG9uc2VUeXBlKSB7XG4gICAgICB0cnkge1xuICAgICAgICByZXF1ZXN0LnJlc3BvbnNlVHlwZSA9IGNvbmZpZy5yZXNwb25zZVR5cGU7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIC8vIEV4cGVjdGVkIERPTUV4Y2VwdGlvbiB0aHJvd24gYnkgYnJvd3NlcnMgbm90IGNvbXBhdGlibGUgWE1MSHR0cFJlcXVlc3QgTGV2ZWwgMi5cbiAgICAgICAgLy8gQnV0LCB0aGlzIGNhbiBiZSBzdXBwcmVzc2VkIGZvciAnanNvbicgdHlwZSBhcyBpdCBjYW4gYmUgcGFyc2VkIGJ5IGRlZmF1bHQgJ3RyYW5zZm9ybVJlc3BvbnNlJyBmdW5jdGlvbi5cbiAgICAgICAgaWYgKGNvbmZpZy5yZXNwb25zZVR5cGUgIT09ICdqc29uJykge1xuICAgICAgICAgIHRocm93IGU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBIYW5kbGUgcHJvZ3Jlc3MgaWYgbmVlZGVkXG4gICAgaWYgKHR5cGVvZiBjb25maWcub25Eb3dubG9hZFByb2dyZXNzID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICByZXF1ZXN0LmFkZEV2ZW50TGlzdGVuZXIoJ3Byb2dyZXNzJywgY29uZmlnLm9uRG93bmxvYWRQcm9ncmVzcyk7XG4gICAgfVxuXG4gICAgLy8gTm90IGFsbCBicm93c2VycyBzdXBwb3J0IHVwbG9hZCBldmVudHNcbiAgICBpZiAodHlwZW9mIGNvbmZpZy5vblVwbG9hZFByb2dyZXNzID09PSAnZnVuY3Rpb24nICYmIHJlcXVlc3QudXBsb2FkKSB7XG4gICAgICByZXF1ZXN0LnVwbG9hZC5hZGRFdmVudExpc3RlbmVyKCdwcm9ncmVzcycsIGNvbmZpZy5vblVwbG9hZFByb2dyZXNzKTtcbiAgICB9XG5cbiAgICBpZiAoY29uZmlnLmNhbmNlbFRva2VuKSB7XG4gICAgICAvLyBIYW5kbGUgY2FuY2VsbGF0aW9uXG4gICAgICBjb25maWcuY2FuY2VsVG9rZW4ucHJvbWlzZS50aGVuKGZ1bmN0aW9uIG9uQ2FuY2VsZWQoY2FuY2VsKSB7XG4gICAgICAgIGlmICghcmVxdWVzdCkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHJlcXVlc3QuYWJvcnQoKTtcbiAgICAgICAgcmVqZWN0KGNhbmNlbCk7XG4gICAgICAgIC8vIENsZWFuIHVwIHJlcXVlc3RcbiAgICAgICAgcmVxdWVzdCA9IG51bGw7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBpZiAoIXJlcXVlc3REYXRhKSB7XG4gICAgICByZXF1ZXN0RGF0YSA9IG51bGw7XG4gICAgfVxuXG4gICAgLy8gU2VuZCB0aGUgcmVxdWVzdFxuICAgIHJlcXVlc3Quc2VuZChyZXF1ZXN0RGF0YSk7XG4gIH0pO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi91dGlscycpO1xudmFyIGJpbmQgPSByZXF1aXJlKCcuL2hlbHBlcnMvYmluZCcpO1xudmFyIEF4aW9zID0gcmVxdWlyZSgnLi9jb3JlL0F4aW9zJyk7XG52YXIgbWVyZ2VDb25maWcgPSByZXF1aXJlKCcuL2NvcmUvbWVyZ2VDb25maWcnKTtcbnZhciBkZWZhdWx0cyA9IHJlcXVpcmUoJy4vZGVmYXVsdHMnKTtcblxuLyoqXG4gKiBDcmVhdGUgYW4gaW5zdGFuY2Ugb2YgQXhpb3NcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gZGVmYXVsdENvbmZpZyBUaGUgZGVmYXVsdCBjb25maWcgZm9yIHRoZSBpbnN0YW5jZVxuICogQHJldHVybiB7QXhpb3N9IEEgbmV3IGluc3RhbmNlIG9mIEF4aW9zXG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZUluc3RhbmNlKGRlZmF1bHRDb25maWcpIHtcbiAgdmFyIGNvbnRleHQgPSBuZXcgQXhpb3MoZGVmYXVsdENvbmZpZyk7XG4gIHZhciBpbnN0YW5jZSA9IGJpbmQoQXhpb3MucHJvdG90eXBlLnJlcXVlc3QsIGNvbnRleHQpO1xuXG4gIC8vIENvcHkgYXhpb3MucHJvdG90eXBlIHRvIGluc3RhbmNlXG4gIHV0aWxzLmV4dGVuZChpbnN0YW5jZSwgQXhpb3MucHJvdG90eXBlLCBjb250ZXh0KTtcblxuICAvLyBDb3B5IGNvbnRleHQgdG8gaW5zdGFuY2VcbiAgdXRpbHMuZXh0ZW5kKGluc3RhbmNlLCBjb250ZXh0KTtcblxuICByZXR1cm4gaW5zdGFuY2U7XG59XG5cbi8vIENyZWF0ZSB0aGUgZGVmYXVsdCBpbnN0YW5jZSB0byBiZSBleHBvcnRlZFxudmFyIGF4aW9zID0gY3JlYXRlSW5zdGFuY2UoZGVmYXVsdHMpO1xuXG4vLyBFeHBvc2UgQXhpb3MgY2xhc3MgdG8gYWxsb3cgY2xhc3MgaW5oZXJpdGFuY2VcbmF4aW9zLkF4aW9zID0gQXhpb3M7XG5cbi8vIEZhY3RvcnkgZm9yIGNyZWF0aW5nIG5ldyBpbnN0YW5jZXNcbmF4aW9zLmNyZWF0ZSA9IGZ1bmN0aW9uIGNyZWF0ZShpbnN0YW5jZUNvbmZpZykge1xuICByZXR1cm4gY3JlYXRlSW5zdGFuY2UobWVyZ2VDb25maWcoYXhpb3MuZGVmYXVsdHMsIGluc3RhbmNlQ29uZmlnKSk7XG59O1xuXG4vLyBFeHBvc2UgQ2FuY2VsICYgQ2FuY2VsVG9rZW5cbmF4aW9zLkNhbmNlbCA9IHJlcXVpcmUoJy4vY2FuY2VsL0NhbmNlbCcpO1xuYXhpb3MuQ2FuY2VsVG9rZW4gPSByZXF1aXJlKCcuL2NhbmNlbC9DYW5jZWxUb2tlbicpO1xuYXhpb3MuaXNDYW5jZWwgPSByZXF1aXJlKCcuL2NhbmNlbC9pc0NhbmNlbCcpO1xuXG4vLyBFeHBvc2UgYWxsL3NwcmVhZFxuYXhpb3MuYWxsID0gZnVuY3Rpb24gYWxsKHByb21pc2VzKSB7XG4gIHJldHVybiBQcm9taXNlLmFsbChwcm9taXNlcyk7XG59O1xuYXhpb3Muc3ByZWFkID0gcmVxdWlyZSgnLi9oZWxwZXJzL3NwcmVhZCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGF4aW9zO1xuXG4vLyBBbGxvdyB1c2Ugb2YgZGVmYXVsdCBpbXBvcnQgc3ludGF4IGluIFR5cGVTY3JpcHRcbm1vZHVsZS5leHBvcnRzLmRlZmF1bHQgPSBheGlvcztcbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBBIGBDYW5jZWxgIGlzIGFuIG9iamVjdCB0aGF0IGlzIHRocm93biB3aGVuIGFuIG9wZXJhdGlvbiBpcyBjYW5jZWxlZC5cbiAqXG4gKiBAY2xhc3NcbiAqIEBwYXJhbSB7c3RyaW5nPX0gbWVzc2FnZSBUaGUgbWVzc2FnZS5cbiAqL1xuZnVuY3Rpb24gQ2FuY2VsKG1lc3NhZ2UpIHtcbiAgdGhpcy5tZXNzYWdlID0gbWVzc2FnZTtcbn1cblxuQ2FuY2VsLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uIHRvU3RyaW5nKCkge1xuICByZXR1cm4gJ0NhbmNlbCcgKyAodGhpcy5tZXNzYWdlID8gJzogJyArIHRoaXMubWVzc2FnZSA6ICcnKTtcbn07XG5cbkNhbmNlbC5wcm90b3R5cGUuX19DQU5DRUxfXyA9IHRydWU7XG5cbm1vZHVsZS5leHBvcnRzID0gQ2FuY2VsO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgQ2FuY2VsID0gcmVxdWlyZSgnLi9DYW5jZWwnKTtcblxuLyoqXG4gKiBBIGBDYW5jZWxUb2tlbmAgaXMgYW4gb2JqZWN0IHRoYXQgY2FuIGJlIHVzZWQgdG8gcmVxdWVzdCBjYW5jZWxsYXRpb24gb2YgYW4gb3BlcmF0aW9uLlxuICpcbiAqIEBjbGFzc1xuICogQHBhcmFtIHtGdW5jdGlvbn0gZXhlY3V0b3IgVGhlIGV4ZWN1dG9yIGZ1bmN0aW9uLlxuICovXG5mdW5jdGlvbiBDYW5jZWxUb2tlbihleGVjdXRvcikge1xuICBpZiAodHlwZW9mIGV4ZWN1dG9yICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignZXhlY3V0b3IgbXVzdCBiZSBhIGZ1bmN0aW9uLicpO1xuICB9XG5cbiAgdmFyIHJlc29sdmVQcm9taXNlO1xuICB0aGlzLnByb21pc2UgPSBuZXcgUHJvbWlzZShmdW5jdGlvbiBwcm9taXNlRXhlY3V0b3IocmVzb2x2ZSkge1xuICAgIHJlc29sdmVQcm9taXNlID0gcmVzb2x2ZTtcbiAgfSk7XG5cbiAgdmFyIHRva2VuID0gdGhpcztcbiAgZXhlY3V0b3IoZnVuY3Rpb24gY2FuY2VsKG1lc3NhZ2UpIHtcbiAgICBpZiAodG9rZW4ucmVhc29uKSB7XG4gICAgICAvLyBDYW5jZWxsYXRpb24gaGFzIGFscmVhZHkgYmVlbiByZXF1ZXN0ZWRcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0b2tlbi5yZWFzb24gPSBuZXcgQ2FuY2VsKG1lc3NhZ2UpO1xuICAgIHJlc29sdmVQcm9taXNlKHRva2VuLnJlYXNvbik7XG4gIH0pO1xufVxuXG4vKipcbiAqIFRocm93cyBhIGBDYW5jZWxgIGlmIGNhbmNlbGxhdGlvbiBoYXMgYmVlbiByZXF1ZXN0ZWQuXG4gKi9cbkNhbmNlbFRva2VuLnByb3RvdHlwZS50aHJvd0lmUmVxdWVzdGVkID0gZnVuY3Rpb24gdGhyb3dJZlJlcXVlc3RlZCgpIHtcbiAgaWYgKHRoaXMucmVhc29uKSB7XG4gICAgdGhyb3cgdGhpcy5yZWFzb247XG4gIH1cbn07XG5cbi8qKlxuICogUmV0dXJucyBhbiBvYmplY3QgdGhhdCBjb250YWlucyBhIG5ldyBgQ2FuY2VsVG9rZW5gIGFuZCBhIGZ1bmN0aW9uIHRoYXQsIHdoZW4gY2FsbGVkLFxuICogY2FuY2VscyB0aGUgYENhbmNlbFRva2VuYC5cbiAqL1xuQ2FuY2VsVG9rZW4uc291cmNlID0gZnVuY3Rpb24gc291cmNlKCkge1xuICB2YXIgY2FuY2VsO1xuICB2YXIgdG9rZW4gPSBuZXcgQ2FuY2VsVG9rZW4oZnVuY3Rpb24gZXhlY3V0b3IoYykge1xuICAgIGNhbmNlbCA9IGM7XG4gIH0pO1xuICByZXR1cm4ge1xuICAgIHRva2VuOiB0b2tlbixcbiAgICBjYW5jZWw6IGNhbmNlbFxuICB9O1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBDYW5jZWxUb2tlbjtcbiIsIid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBpc0NhbmNlbCh2YWx1ZSkge1xuICByZXR1cm4gISEodmFsdWUgJiYgdmFsdWUuX19DQU5DRUxfXyk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG52YXIgYnVpbGRVUkwgPSByZXF1aXJlKCcuLi9oZWxwZXJzL2J1aWxkVVJMJyk7XG52YXIgSW50ZXJjZXB0b3JNYW5hZ2VyID0gcmVxdWlyZSgnLi9JbnRlcmNlcHRvck1hbmFnZXInKTtcbnZhciBkaXNwYXRjaFJlcXVlc3QgPSByZXF1aXJlKCcuL2Rpc3BhdGNoUmVxdWVzdCcpO1xudmFyIG1lcmdlQ29uZmlnID0gcmVxdWlyZSgnLi9tZXJnZUNvbmZpZycpO1xuXG4vKipcbiAqIENyZWF0ZSBhIG5ldyBpbnN0YW5jZSBvZiBBeGlvc1xuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBpbnN0YW5jZUNvbmZpZyBUaGUgZGVmYXVsdCBjb25maWcgZm9yIHRoZSBpbnN0YW5jZVxuICovXG5mdW5jdGlvbiBBeGlvcyhpbnN0YW5jZUNvbmZpZykge1xuICB0aGlzLmRlZmF1bHRzID0gaW5zdGFuY2VDb25maWc7XG4gIHRoaXMuaW50ZXJjZXB0b3JzID0ge1xuICAgIHJlcXVlc3Q6IG5ldyBJbnRlcmNlcHRvck1hbmFnZXIoKSxcbiAgICByZXNwb25zZTogbmV3IEludGVyY2VwdG9yTWFuYWdlcigpXG4gIH07XG59XG5cbi8qKlxuICogRGlzcGF0Y2ggYSByZXF1ZXN0XG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGNvbmZpZyBUaGUgY29uZmlnIHNwZWNpZmljIGZvciB0aGlzIHJlcXVlc3QgKG1lcmdlZCB3aXRoIHRoaXMuZGVmYXVsdHMpXG4gKi9cbkF4aW9zLnByb3RvdHlwZS5yZXF1ZXN0ID0gZnVuY3Rpb24gcmVxdWVzdChjb25maWcpIHtcbiAgLyplc2xpbnQgbm8tcGFyYW0tcmVhc3NpZ246MCovXG4gIC8vIEFsbG93IGZvciBheGlvcygnZXhhbXBsZS91cmwnWywgY29uZmlnXSkgYSBsYSBmZXRjaCBBUElcbiAgaWYgKHR5cGVvZiBjb25maWcgPT09ICdzdHJpbmcnKSB7XG4gICAgY29uZmlnID0gYXJndW1lbnRzWzFdIHx8IHt9O1xuICAgIGNvbmZpZy51cmwgPSBhcmd1bWVudHNbMF07XG4gIH0gZWxzZSB7XG4gICAgY29uZmlnID0gY29uZmlnIHx8IHt9O1xuICB9XG5cbiAgY29uZmlnID0gbWVyZ2VDb25maWcodGhpcy5kZWZhdWx0cywgY29uZmlnKTtcblxuICAvLyBTZXQgY29uZmlnLm1ldGhvZFxuICBpZiAoY29uZmlnLm1ldGhvZCkge1xuICAgIGNvbmZpZy5tZXRob2QgPSBjb25maWcubWV0aG9kLnRvTG93ZXJDYXNlKCk7XG4gIH0gZWxzZSBpZiAodGhpcy5kZWZhdWx0cy5tZXRob2QpIHtcbiAgICBjb25maWcubWV0aG9kID0gdGhpcy5kZWZhdWx0cy5tZXRob2QudG9Mb3dlckNhc2UoKTtcbiAgfSBlbHNlIHtcbiAgICBjb25maWcubWV0aG9kID0gJ2dldCc7XG4gIH1cblxuICAvLyBIb29rIHVwIGludGVyY2VwdG9ycyBtaWRkbGV3YXJlXG4gIHZhciBjaGFpbiA9IFtkaXNwYXRjaFJlcXVlc3QsIHVuZGVmaW5lZF07XG4gIHZhciBwcm9taXNlID0gUHJvbWlzZS5yZXNvbHZlKGNvbmZpZyk7XG5cbiAgdGhpcy5pbnRlcmNlcHRvcnMucmVxdWVzdC5mb3JFYWNoKGZ1bmN0aW9uIHVuc2hpZnRSZXF1ZXN0SW50ZXJjZXB0b3JzKGludGVyY2VwdG9yKSB7XG4gICAgY2hhaW4udW5zaGlmdChpbnRlcmNlcHRvci5mdWxmaWxsZWQsIGludGVyY2VwdG9yLnJlamVjdGVkKTtcbiAgfSk7XG5cbiAgdGhpcy5pbnRlcmNlcHRvcnMucmVzcG9uc2UuZm9yRWFjaChmdW5jdGlvbiBwdXNoUmVzcG9uc2VJbnRlcmNlcHRvcnMoaW50ZXJjZXB0b3IpIHtcbiAgICBjaGFpbi5wdXNoKGludGVyY2VwdG9yLmZ1bGZpbGxlZCwgaW50ZXJjZXB0b3IucmVqZWN0ZWQpO1xuICB9KTtcblxuICB3aGlsZSAoY2hhaW4ubGVuZ3RoKSB7XG4gICAgcHJvbWlzZSA9IHByb21pc2UudGhlbihjaGFpbi5zaGlmdCgpLCBjaGFpbi5zaGlmdCgpKTtcbiAgfVxuXG4gIHJldHVybiBwcm9taXNlO1xufTtcblxuQXhpb3MucHJvdG90eXBlLmdldFVyaSA9IGZ1bmN0aW9uIGdldFVyaShjb25maWcpIHtcbiAgY29uZmlnID0gbWVyZ2VDb25maWcodGhpcy5kZWZhdWx0cywgY29uZmlnKTtcbiAgcmV0dXJuIGJ1aWxkVVJMKGNvbmZpZy51cmwsIGNvbmZpZy5wYXJhbXMsIGNvbmZpZy5wYXJhbXNTZXJpYWxpemVyKS5yZXBsYWNlKC9eXFw/LywgJycpO1xufTtcblxuLy8gUHJvdmlkZSBhbGlhc2VzIGZvciBzdXBwb3J0ZWQgcmVxdWVzdCBtZXRob2RzXG51dGlscy5mb3JFYWNoKFsnZGVsZXRlJywgJ2dldCcsICdoZWFkJywgJ29wdGlvbnMnXSwgZnVuY3Rpb24gZm9yRWFjaE1ldGhvZE5vRGF0YShtZXRob2QpIHtcbiAgLyplc2xpbnQgZnVuYy1uYW1lczowKi9cbiAgQXhpb3MucHJvdG90eXBlW21ldGhvZF0gPSBmdW5jdGlvbih1cmwsIGNvbmZpZykge1xuICAgIHJldHVybiB0aGlzLnJlcXVlc3QobWVyZ2VDb25maWcoY29uZmlnIHx8IHt9LCB7XG4gICAgICBtZXRob2Q6IG1ldGhvZCxcbiAgICAgIHVybDogdXJsXG4gICAgfSkpO1xuICB9O1xufSk7XG5cbnV0aWxzLmZvckVhY2goWydwb3N0JywgJ3B1dCcsICdwYXRjaCddLCBmdW5jdGlvbiBmb3JFYWNoTWV0aG9kV2l0aERhdGEobWV0aG9kKSB7XG4gIC8qZXNsaW50IGZ1bmMtbmFtZXM6MCovXG4gIEF4aW9zLnByb3RvdHlwZVttZXRob2RdID0gZnVuY3Rpb24odXJsLCBkYXRhLCBjb25maWcpIHtcbiAgICByZXR1cm4gdGhpcy5yZXF1ZXN0KG1lcmdlQ29uZmlnKGNvbmZpZyB8fCB7fSwge1xuICAgICAgbWV0aG9kOiBtZXRob2QsXG4gICAgICB1cmw6IHVybCxcbiAgICAgIGRhdGE6IGRhdGFcbiAgICB9KSk7XG4gIH07XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBBeGlvcztcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xuXG5mdW5jdGlvbiBJbnRlcmNlcHRvck1hbmFnZXIoKSB7XG4gIHRoaXMuaGFuZGxlcnMgPSBbXTtcbn1cblxuLyoqXG4gKiBBZGQgYSBuZXcgaW50ZXJjZXB0b3IgdG8gdGhlIHN0YWNrXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZnVsZmlsbGVkIFRoZSBmdW5jdGlvbiB0byBoYW5kbGUgYHRoZW5gIGZvciBhIGBQcm9taXNlYFxuICogQHBhcmFtIHtGdW5jdGlvbn0gcmVqZWN0ZWQgVGhlIGZ1bmN0aW9uIHRvIGhhbmRsZSBgcmVqZWN0YCBmb3IgYSBgUHJvbWlzZWBcbiAqXG4gKiBAcmV0dXJuIHtOdW1iZXJ9IEFuIElEIHVzZWQgdG8gcmVtb3ZlIGludGVyY2VwdG9yIGxhdGVyXG4gKi9cbkludGVyY2VwdG9yTWFuYWdlci5wcm90b3R5cGUudXNlID0gZnVuY3Rpb24gdXNlKGZ1bGZpbGxlZCwgcmVqZWN0ZWQpIHtcbiAgdGhpcy5oYW5kbGVycy5wdXNoKHtcbiAgICBmdWxmaWxsZWQ6IGZ1bGZpbGxlZCxcbiAgICByZWplY3RlZDogcmVqZWN0ZWRcbiAgfSk7XG4gIHJldHVybiB0aGlzLmhhbmRsZXJzLmxlbmd0aCAtIDE7XG59O1xuXG4vKipcbiAqIFJlbW92ZSBhbiBpbnRlcmNlcHRvciBmcm9tIHRoZSBzdGFja1xuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBpZCBUaGUgSUQgdGhhdCB3YXMgcmV0dXJuZWQgYnkgYHVzZWBcbiAqL1xuSW50ZXJjZXB0b3JNYW5hZ2VyLnByb3RvdHlwZS5lamVjdCA9IGZ1bmN0aW9uIGVqZWN0KGlkKSB7XG4gIGlmICh0aGlzLmhhbmRsZXJzW2lkXSkge1xuICAgIHRoaXMuaGFuZGxlcnNbaWRdID0gbnVsbDtcbiAgfVxufTtcblxuLyoqXG4gKiBJdGVyYXRlIG92ZXIgYWxsIHRoZSByZWdpc3RlcmVkIGludGVyY2VwdG9yc1xuICpcbiAqIFRoaXMgbWV0aG9kIGlzIHBhcnRpY3VsYXJseSB1c2VmdWwgZm9yIHNraXBwaW5nIG92ZXIgYW55XG4gKiBpbnRlcmNlcHRvcnMgdGhhdCBtYXkgaGF2ZSBiZWNvbWUgYG51bGxgIGNhbGxpbmcgYGVqZWN0YC5cbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiBUaGUgZnVuY3Rpb24gdG8gY2FsbCBmb3IgZWFjaCBpbnRlcmNlcHRvclxuICovXG5JbnRlcmNlcHRvck1hbmFnZXIucHJvdG90eXBlLmZvckVhY2ggPSBmdW5jdGlvbiBmb3JFYWNoKGZuKSB7XG4gIHV0aWxzLmZvckVhY2godGhpcy5oYW5kbGVycywgZnVuY3Rpb24gZm9yRWFjaEhhbmRsZXIoaCkge1xuICAgIGlmIChoICE9PSBudWxsKSB7XG4gICAgICBmbihoKTtcbiAgICB9XG4gIH0pO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBJbnRlcmNlcHRvck1hbmFnZXI7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBpc0Fic29sdXRlVVJMID0gcmVxdWlyZSgnLi4vaGVscGVycy9pc0Fic29sdXRlVVJMJyk7XG52YXIgY29tYmluZVVSTHMgPSByZXF1aXJlKCcuLi9oZWxwZXJzL2NvbWJpbmVVUkxzJyk7XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyBVUkwgYnkgY29tYmluaW5nIHRoZSBiYXNlVVJMIHdpdGggdGhlIHJlcXVlc3RlZFVSTCxcbiAqIG9ubHkgd2hlbiB0aGUgcmVxdWVzdGVkVVJMIGlzIG5vdCBhbHJlYWR5IGFuIGFic29sdXRlIFVSTC5cbiAqIElmIHRoZSByZXF1ZXN0VVJMIGlzIGFic29sdXRlLCB0aGlzIGZ1bmN0aW9uIHJldHVybnMgdGhlIHJlcXVlc3RlZFVSTCB1bnRvdWNoZWQuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IGJhc2VVUkwgVGhlIGJhc2UgVVJMXG4gKiBAcGFyYW0ge3N0cmluZ30gcmVxdWVzdGVkVVJMIEFic29sdXRlIG9yIHJlbGF0aXZlIFVSTCB0byBjb21iaW5lXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBUaGUgY29tYmluZWQgZnVsbCBwYXRoXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gYnVpbGRGdWxsUGF0aChiYXNlVVJMLCByZXF1ZXN0ZWRVUkwpIHtcbiAgaWYgKGJhc2VVUkwgJiYgIWlzQWJzb2x1dGVVUkwocmVxdWVzdGVkVVJMKSkge1xuICAgIHJldHVybiBjb21iaW5lVVJMcyhiYXNlVVJMLCByZXF1ZXN0ZWRVUkwpO1xuICB9XG4gIHJldHVybiByZXF1ZXN0ZWRVUkw7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgZW5oYW5jZUVycm9yID0gcmVxdWlyZSgnLi9lbmhhbmNlRXJyb3InKTtcblxuLyoqXG4gKiBDcmVhdGUgYW4gRXJyb3Igd2l0aCB0aGUgc3BlY2lmaWVkIG1lc3NhZ2UsIGNvbmZpZywgZXJyb3IgY29kZSwgcmVxdWVzdCBhbmQgcmVzcG9uc2UuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IG1lc3NhZ2UgVGhlIGVycm9yIG1lc3NhZ2UuXG4gKiBAcGFyYW0ge09iamVjdH0gY29uZmlnIFRoZSBjb25maWcuXG4gKiBAcGFyYW0ge3N0cmluZ30gW2NvZGVdIFRoZSBlcnJvciBjb2RlIChmb3IgZXhhbXBsZSwgJ0VDT05OQUJPUlRFRCcpLlxuICogQHBhcmFtIHtPYmplY3R9IFtyZXF1ZXN0XSBUaGUgcmVxdWVzdC5cbiAqIEBwYXJhbSB7T2JqZWN0fSBbcmVzcG9uc2VdIFRoZSByZXNwb25zZS5cbiAqIEByZXR1cm5zIHtFcnJvcn0gVGhlIGNyZWF0ZWQgZXJyb3IuXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gY3JlYXRlRXJyb3IobWVzc2FnZSwgY29uZmlnLCBjb2RlLCByZXF1ZXN0LCByZXNwb25zZSkge1xuICB2YXIgZXJyb3IgPSBuZXcgRXJyb3IobWVzc2FnZSk7XG4gIHJldHVybiBlbmhhbmNlRXJyb3IoZXJyb3IsIGNvbmZpZywgY29kZSwgcmVxdWVzdCwgcmVzcG9uc2UpO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xudmFyIHRyYW5zZm9ybURhdGEgPSByZXF1aXJlKCcuL3RyYW5zZm9ybURhdGEnKTtcbnZhciBpc0NhbmNlbCA9IHJlcXVpcmUoJy4uL2NhbmNlbC9pc0NhbmNlbCcpO1xudmFyIGRlZmF1bHRzID0gcmVxdWlyZSgnLi4vZGVmYXVsdHMnKTtcblxuLyoqXG4gKiBUaHJvd3MgYSBgQ2FuY2VsYCBpZiBjYW5jZWxsYXRpb24gaGFzIGJlZW4gcmVxdWVzdGVkLlxuICovXG5mdW5jdGlvbiB0aHJvd0lmQ2FuY2VsbGF0aW9uUmVxdWVzdGVkKGNvbmZpZykge1xuICBpZiAoY29uZmlnLmNhbmNlbFRva2VuKSB7XG4gICAgY29uZmlnLmNhbmNlbFRva2VuLnRocm93SWZSZXF1ZXN0ZWQoKTtcbiAgfVxufVxuXG4vKipcbiAqIERpc3BhdGNoIGEgcmVxdWVzdCB0byB0aGUgc2VydmVyIHVzaW5nIHRoZSBjb25maWd1cmVkIGFkYXB0ZXIuXG4gKlxuICogQHBhcmFtIHtvYmplY3R9IGNvbmZpZyBUaGUgY29uZmlnIHRoYXQgaXMgdG8gYmUgdXNlZCBmb3IgdGhlIHJlcXVlc3RcbiAqIEByZXR1cm5zIHtQcm9taXNlfSBUaGUgUHJvbWlzZSB0byBiZSBmdWxmaWxsZWRcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBkaXNwYXRjaFJlcXVlc3QoY29uZmlnKSB7XG4gIHRocm93SWZDYW5jZWxsYXRpb25SZXF1ZXN0ZWQoY29uZmlnKTtcblxuICAvLyBFbnN1cmUgaGVhZGVycyBleGlzdFxuICBjb25maWcuaGVhZGVycyA9IGNvbmZpZy5oZWFkZXJzIHx8IHt9O1xuXG4gIC8vIFRyYW5zZm9ybSByZXF1ZXN0IGRhdGFcbiAgY29uZmlnLmRhdGEgPSB0cmFuc2Zvcm1EYXRhKFxuICAgIGNvbmZpZy5kYXRhLFxuICAgIGNvbmZpZy5oZWFkZXJzLFxuICAgIGNvbmZpZy50cmFuc2Zvcm1SZXF1ZXN0XG4gICk7XG5cbiAgLy8gRmxhdHRlbiBoZWFkZXJzXG4gIGNvbmZpZy5oZWFkZXJzID0gdXRpbHMubWVyZ2UoXG4gICAgY29uZmlnLmhlYWRlcnMuY29tbW9uIHx8IHt9LFxuICAgIGNvbmZpZy5oZWFkZXJzW2NvbmZpZy5tZXRob2RdIHx8IHt9LFxuICAgIGNvbmZpZy5oZWFkZXJzXG4gICk7XG5cbiAgdXRpbHMuZm9yRWFjaChcbiAgICBbJ2RlbGV0ZScsICdnZXQnLCAnaGVhZCcsICdwb3N0JywgJ3B1dCcsICdwYXRjaCcsICdjb21tb24nXSxcbiAgICBmdW5jdGlvbiBjbGVhbkhlYWRlckNvbmZpZyhtZXRob2QpIHtcbiAgICAgIGRlbGV0ZSBjb25maWcuaGVhZGVyc1ttZXRob2RdO1xuICAgIH1cbiAgKTtcblxuICB2YXIgYWRhcHRlciA9IGNvbmZpZy5hZGFwdGVyIHx8IGRlZmF1bHRzLmFkYXB0ZXI7XG5cbiAgcmV0dXJuIGFkYXB0ZXIoY29uZmlnKS50aGVuKGZ1bmN0aW9uIG9uQWRhcHRlclJlc29sdXRpb24ocmVzcG9uc2UpIHtcbiAgICB0aHJvd0lmQ2FuY2VsbGF0aW9uUmVxdWVzdGVkKGNvbmZpZyk7XG5cbiAgICAvLyBUcmFuc2Zvcm0gcmVzcG9uc2UgZGF0YVxuICAgIHJlc3BvbnNlLmRhdGEgPSB0cmFuc2Zvcm1EYXRhKFxuICAgICAgcmVzcG9uc2UuZGF0YSxcbiAgICAgIHJlc3BvbnNlLmhlYWRlcnMsXG4gICAgICBjb25maWcudHJhbnNmb3JtUmVzcG9uc2VcbiAgICApO1xuXG4gICAgcmV0dXJuIHJlc3BvbnNlO1xuICB9LCBmdW5jdGlvbiBvbkFkYXB0ZXJSZWplY3Rpb24ocmVhc29uKSB7XG4gICAgaWYgKCFpc0NhbmNlbChyZWFzb24pKSB7XG4gICAgICB0aHJvd0lmQ2FuY2VsbGF0aW9uUmVxdWVzdGVkKGNvbmZpZyk7XG5cbiAgICAgIC8vIFRyYW5zZm9ybSByZXNwb25zZSBkYXRhXG4gICAgICBpZiAocmVhc29uICYmIHJlYXNvbi5yZXNwb25zZSkge1xuICAgICAgICByZWFzb24ucmVzcG9uc2UuZGF0YSA9IHRyYW5zZm9ybURhdGEoXG4gICAgICAgICAgcmVhc29uLnJlc3BvbnNlLmRhdGEsXG4gICAgICAgICAgcmVhc29uLnJlc3BvbnNlLmhlYWRlcnMsXG4gICAgICAgICAgY29uZmlnLnRyYW5zZm9ybVJlc3BvbnNlXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIFByb21pc2UucmVqZWN0KHJlYXNvbik7XG4gIH0pO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBVcGRhdGUgYW4gRXJyb3Igd2l0aCB0aGUgc3BlY2lmaWVkIGNvbmZpZywgZXJyb3IgY29kZSwgYW5kIHJlc3BvbnNlLlxuICpcbiAqIEBwYXJhbSB7RXJyb3J9IGVycm9yIFRoZSBlcnJvciB0byB1cGRhdGUuXG4gKiBAcGFyYW0ge09iamVjdH0gY29uZmlnIFRoZSBjb25maWcuXG4gKiBAcGFyYW0ge3N0cmluZ30gW2NvZGVdIFRoZSBlcnJvciBjb2RlIChmb3IgZXhhbXBsZSwgJ0VDT05OQUJPUlRFRCcpLlxuICogQHBhcmFtIHtPYmplY3R9IFtyZXF1ZXN0XSBUaGUgcmVxdWVzdC5cbiAqIEBwYXJhbSB7T2JqZWN0fSBbcmVzcG9uc2VdIFRoZSByZXNwb25zZS5cbiAqIEByZXR1cm5zIHtFcnJvcn0gVGhlIGVycm9yLlxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGVuaGFuY2VFcnJvcihlcnJvciwgY29uZmlnLCBjb2RlLCByZXF1ZXN0LCByZXNwb25zZSkge1xuICBlcnJvci5jb25maWcgPSBjb25maWc7XG4gIGlmIChjb2RlKSB7XG4gICAgZXJyb3IuY29kZSA9IGNvZGU7XG4gIH1cblxuICBlcnJvci5yZXF1ZXN0ID0gcmVxdWVzdDtcbiAgZXJyb3IucmVzcG9uc2UgPSByZXNwb25zZTtcbiAgZXJyb3IuaXNBeGlvc0Vycm9yID0gdHJ1ZTtcblxuICBlcnJvci50b0pTT04gPSBmdW5jdGlvbiB0b0pTT04oKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIC8vIFN0YW5kYXJkXG4gICAgICBtZXNzYWdlOiB0aGlzLm1lc3NhZ2UsXG4gICAgICBuYW1lOiB0aGlzLm5hbWUsXG4gICAgICAvLyBNaWNyb3NvZnRcbiAgICAgIGRlc2NyaXB0aW9uOiB0aGlzLmRlc2NyaXB0aW9uLFxuICAgICAgbnVtYmVyOiB0aGlzLm51bWJlcixcbiAgICAgIC8vIE1vemlsbGFcbiAgICAgIGZpbGVOYW1lOiB0aGlzLmZpbGVOYW1lLFxuICAgICAgbGluZU51bWJlcjogdGhpcy5saW5lTnVtYmVyLFxuICAgICAgY29sdW1uTnVtYmVyOiB0aGlzLmNvbHVtbk51bWJlcixcbiAgICAgIHN0YWNrOiB0aGlzLnN0YWNrLFxuICAgICAgLy8gQXhpb3NcbiAgICAgIGNvbmZpZzogdGhpcy5jb25maWcsXG4gICAgICBjb2RlOiB0aGlzLmNvZGVcbiAgICB9O1xuICB9O1xuICByZXR1cm4gZXJyb3I7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLi91dGlscycpO1xuXG4vKipcbiAqIENvbmZpZy1zcGVjaWZpYyBtZXJnZS1mdW5jdGlvbiB3aGljaCBjcmVhdGVzIGEgbmV3IGNvbmZpZy1vYmplY3RcbiAqIGJ5IG1lcmdpbmcgdHdvIGNvbmZpZ3VyYXRpb24gb2JqZWN0cyB0b2dldGhlci5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gY29uZmlnMVxuICogQHBhcmFtIHtPYmplY3R9IGNvbmZpZzJcbiAqIEByZXR1cm5zIHtPYmplY3R9IE5ldyBvYmplY3QgcmVzdWx0aW5nIGZyb20gbWVyZ2luZyBjb25maWcyIHRvIGNvbmZpZzFcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBtZXJnZUNvbmZpZyhjb25maWcxLCBjb25maWcyKSB7XG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1wYXJhbS1yZWFzc2lnblxuICBjb25maWcyID0gY29uZmlnMiB8fCB7fTtcbiAgdmFyIGNvbmZpZyA9IHt9O1xuXG4gIHZhciB2YWx1ZUZyb21Db25maWcyS2V5cyA9IFsndXJsJywgJ21ldGhvZCcsICdkYXRhJ107XG4gIHZhciBtZXJnZURlZXBQcm9wZXJ0aWVzS2V5cyA9IFsnaGVhZGVycycsICdhdXRoJywgJ3Byb3h5JywgJ3BhcmFtcyddO1xuICB2YXIgZGVmYXVsdFRvQ29uZmlnMktleXMgPSBbXG4gICAgJ2Jhc2VVUkwnLCAndHJhbnNmb3JtUmVxdWVzdCcsICd0cmFuc2Zvcm1SZXNwb25zZScsICdwYXJhbXNTZXJpYWxpemVyJyxcbiAgICAndGltZW91dCcsICd0aW1lb3V0TWVzc2FnZScsICd3aXRoQ3JlZGVudGlhbHMnLCAnYWRhcHRlcicsICdyZXNwb25zZVR5cGUnLCAneHNyZkNvb2tpZU5hbWUnLFxuICAgICd4c3JmSGVhZGVyTmFtZScsICdvblVwbG9hZFByb2dyZXNzJywgJ29uRG93bmxvYWRQcm9ncmVzcycsICdkZWNvbXByZXNzJyxcbiAgICAnbWF4Q29udGVudExlbmd0aCcsICdtYXhCb2R5TGVuZ3RoJywgJ21heFJlZGlyZWN0cycsICd0cmFuc3BvcnQnLCAnaHR0cEFnZW50JyxcbiAgICAnaHR0cHNBZ2VudCcsICdjYW5jZWxUb2tlbicsICdzb2NrZXRQYXRoJywgJ3Jlc3BvbnNlRW5jb2RpbmcnXG4gIF07XG4gIHZhciBkaXJlY3RNZXJnZUtleXMgPSBbJ3ZhbGlkYXRlU3RhdHVzJ107XG5cbiAgZnVuY3Rpb24gZ2V0TWVyZ2VkVmFsdWUodGFyZ2V0LCBzb3VyY2UpIHtcbiAgICBpZiAodXRpbHMuaXNQbGFpbk9iamVjdCh0YXJnZXQpICYmIHV0aWxzLmlzUGxhaW5PYmplY3Qoc291cmNlKSkge1xuICAgICAgcmV0dXJuIHV0aWxzLm1lcmdlKHRhcmdldCwgc291cmNlKTtcbiAgICB9IGVsc2UgaWYgKHV0aWxzLmlzUGxhaW5PYmplY3Qoc291cmNlKSkge1xuICAgICAgcmV0dXJuIHV0aWxzLm1lcmdlKHt9LCBzb3VyY2UpO1xuICAgIH0gZWxzZSBpZiAodXRpbHMuaXNBcnJheShzb3VyY2UpKSB7XG4gICAgICByZXR1cm4gc291cmNlLnNsaWNlKCk7XG4gICAgfVxuICAgIHJldHVybiBzb3VyY2U7XG4gIH1cblxuICBmdW5jdGlvbiBtZXJnZURlZXBQcm9wZXJ0aWVzKHByb3ApIHtcbiAgICBpZiAoIXV0aWxzLmlzVW5kZWZpbmVkKGNvbmZpZzJbcHJvcF0pKSB7XG4gICAgICBjb25maWdbcHJvcF0gPSBnZXRNZXJnZWRWYWx1ZShjb25maWcxW3Byb3BdLCBjb25maWcyW3Byb3BdKTtcbiAgICB9IGVsc2UgaWYgKCF1dGlscy5pc1VuZGVmaW5lZChjb25maWcxW3Byb3BdKSkge1xuICAgICAgY29uZmlnW3Byb3BdID0gZ2V0TWVyZ2VkVmFsdWUodW5kZWZpbmVkLCBjb25maWcxW3Byb3BdKTtcbiAgICB9XG4gIH1cblxuICB1dGlscy5mb3JFYWNoKHZhbHVlRnJvbUNvbmZpZzJLZXlzLCBmdW5jdGlvbiB2YWx1ZUZyb21Db25maWcyKHByb3ApIHtcbiAgICBpZiAoIXV0aWxzLmlzVW5kZWZpbmVkKGNvbmZpZzJbcHJvcF0pKSB7XG4gICAgICBjb25maWdbcHJvcF0gPSBnZXRNZXJnZWRWYWx1ZSh1bmRlZmluZWQsIGNvbmZpZzJbcHJvcF0pO1xuICAgIH1cbiAgfSk7XG5cbiAgdXRpbHMuZm9yRWFjaChtZXJnZURlZXBQcm9wZXJ0aWVzS2V5cywgbWVyZ2VEZWVwUHJvcGVydGllcyk7XG5cbiAgdXRpbHMuZm9yRWFjaChkZWZhdWx0VG9Db25maWcyS2V5cywgZnVuY3Rpb24gZGVmYXVsdFRvQ29uZmlnMihwcm9wKSB7XG4gICAgaWYgKCF1dGlscy5pc1VuZGVmaW5lZChjb25maWcyW3Byb3BdKSkge1xuICAgICAgY29uZmlnW3Byb3BdID0gZ2V0TWVyZ2VkVmFsdWUodW5kZWZpbmVkLCBjb25maWcyW3Byb3BdKTtcbiAgICB9IGVsc2UgaWYgKCF1dGlscy5pc1VuZGVmaW5lZChjb25maWcxW3Byb3BdKSkge1xuICAgICAgY29uZmlnW3Byb3BdID0gZ2V0TWVyZ2VkVmFsdWUodW5kZWZpbmVkLCBjb25maWcxW3Byb3BdKTtcbiAgICB9XG4gIH0pO1xuXG4gIHV0aWxzLmZvckVhY2goZGlyZWN0TWVyZ2VLZXlzLCBmdW5jdGlvbiBtZXJnZShwcm9wKSB7XG4gICAgaWYgKHByb3AgaW4gY29uZmlnMikge1xuICAgICAgY29uZmlnW3Byb3BdID0gZ2V0TWVyZ2VkVmFsdWUoY29uZmlnMVtwcm9wXSwgY29uZmlnMltwcm9wXSk7XG4gICAgfSBlbHNlIGlmIChwcm9wIGluIGNvbmZpZzEpIHtcbiAgICAgIGNvbmZpZ1twcm9wXSA9IGdldE1lcmdlZFZhbHVlKHVuZGVmaW5lZCwgY29uZmlnMVtwcm9wXSk7XG4gICAgfVxuICB9KTtcblxuICB2YXIgYXhpb3NLZXlzID0gdmFsdWVGcm9tQ29uZmlnMktleXNcbiAgICAuY29uY2F0KG1lcmdlRGVlcFByb3BlcnRpZXNLZXlzKVxuICAgIC5jb25jYXQoZGVmYXVsdFRvQ29uZmlnMktleXMpXG4gICAgLmNvbmNhdChkaXJlY3RNZXJnZUtleXMpO1xuXG4gIHZhciBvdGhlcktleXMgPSBPYmplY3RcbiAgICAua2V5cyhjb25maWcxKVxuICAgIC5jb25jYXQoT2JqZWN0LmtleXMoY29uZmlnMikpXG4gICAgLmZpbHRlcihmdW5jdGlvbiBmaWx0ZXJBeGlvc0tleXMoa2V5KSB7XG4gICAgICByZXR1cm4gYXhpb3NLZXlzLmluZGV4T2Yoa2V5KSA9PT0gLTE7XG4gICAgfSk7XG5cbiAgdXRpbHMuZm9yRWFjaChvdGhlcktleXMsIG1lcmdlRGVlcFByb3BlcnRpZXMpO1xuXG4gIHJldHVybiBjb25maWc7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgY3JlYXRlRXJyb3IgPSByZXF1aXJlKCcuL2NyZWF0ZUVycm9yJyk7XG5cbi8qKlxuICogUmVzb2x2ZSBvciByZWplY3QgYSBQcm9taXNlIGJhc2VkIG9uIHJlc3BvbnNlIHN0YXR1cy5cbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSByZXNvbHZlIEEgZnVuY3Rpb24gdGhhdCByZXNvbHZlcyB0aGUgcHJvbWlzZS5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IHJlamVjdCBBIGZ1bmN0aW9uIHRoYXQgcmVqZWN0cyB0aGUgcHJvbWlzZS5cbiAqIEBwYXJhbSB7b2JqZWN0fSByZXNwb25zZSBUaGUgcmVzcG9uc2UuXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gc2V0dGxlKHJlc29sdmUsIHJlamVjdCwgcmVzcG9uc2UpIHtcbiAgdmFyIHZhbGlkYXRlU3RhdHVzID0gcmVzcG9uc2UuY29uZmlnLnZhbGlkYXRlU3RhdHVzO1xuICBpZiAoIXJlc3BvbnNlLnN0YXR1cyB8fCAhdmFsaWRhdGVTdGF0dXMgfHwgdmFsaWRhdGVTdGF0dXMocmVzcG9uc2Uuc3RhdHVzKSkge1xuICAgIHJlc29sdmUocmVzcG9uc2UpO1xuICB9IGVsc2Uge1xuICAgIHJlamVjdChjcmVhdGVFcnJvcihcbiAgICAgICdSZXF1ZXN0IGZhaWxlZCB3aXRoIHN0YXR1cyBjb2RlICcgKyByZXNwb25zZS5zdGF0dXMsXG4gICAgICByZXNwb25zZS5jb25maWcsXG4gICAgICBudWxsLFxuICAgICAgcmVzcG9uc2UucmVxdWVzdCxcbiAgICAgIHJlc3BvbnNlXG4gICAgKSk7XG4gIH1cbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcblxuLyoqXG4gKiBUcmFuc2Zvcm0gdGhlIGRhdGEgZm9yIGEgcmVxdWVzdCBvciBhIHJlc3BvbnNlXG4gKlxuICogQHBhcmFtIHtPYmplY3R8U3RyaW5nfSBkYXRhIFRoZSBkYXRhIHRvIGJlIHRyYW5zZm9ybWVkXG4gKiBAcGFyYW0ge0FycmF5fSBoZWFkZXJzIFRoZSBoZWFkZXJzIGZvciB0aGUgcmVxdWVzdCBvciByZXNwb25zZVxuICogQHBhcmFtIHtBcnJheXxGdW5jdGlvbn0gZm5zIEEgc2luZ2xlIGZ1bmN0aW9uIG9yIEFycmF5IG9mIGZ1bmN0aW9uc1xuICogQHJldHVybnMgeyp9IFRoZSByZXN1bHRpbmcgdHJhbnNmb3JtZWQgZGF0YVxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHRyYW5zZm9ybURhdGEoZGF0YSwgaGVhZGVycywgZm5zKSB7XG4gIC8qZXNsaW50IG5vLXBhcmFtLXJlYXNzaWduOjAqL1xuICB1dGlscy5mb3JFYWNoKGZucywgZnVuY3Rpb24gdHJhbnNmb3JtKGZuKSB7XG4gICAgZGF0YSA9IGZuKGRhdGEsIGhlYWRlcnMpO1xuICB9KTtcblxuICByZXR1cm4gZGF0YTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vdXRpbHMnKTtcbnZhciBub3JtYWxpemVIZWFkZXJOYW1lID0gcmVxdWlyZSgnLi9oZWxwZXJzL25vcm1hbGl6ZUhlYWRlck5hbWUnKTtcblxudmFyIERFRkFVTFRfQ09OVEVOVF9UWVBFID0ge1xuICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCdcbn07XG5cbmZ1bmN0aW9uIHNldENvbnRlbnRUeXBlSWZVbnNldChoZWFkZXJzLCB2YWx1ZSkge1xuICBpZiAoIXV0aWxzLmlzVW5kZWZpbmVkKGhlYWRlcnMpICYmIHV0aWxzLmlzVW5kZWZpbmVkKGhlYWRlcnNbJ0NvbnRlbnQtVHlwZSddKSkge1xuICAgIGhlYWRlcnNbJ0NvbnRlbnQtVHlwZSddID0gdmFsdWU7XG4gIH1cbn1cblxuZnVuY3Rpb24gZ2V0RGVmYXVsdEFkYXB0ZXIoKSB7XG4gIHZhciBhZGFwdGVyO1xuICBpZiAodHlwZW9mIFhNTEh0dHBSZXF1ZXN0ICE9PSAndW5kZWZpbmVkJykge1xuICAgIC8vIEZvciBicm93c2VycyB1c2UgWEhSIGFkYXB0ZXJcbiAgICBhZGFwdGVyID0gcmVxdWlyZSgnLi9hZGFwdGVycy94aHInKTtcbiAgfSBlbHNlIGlmICh0eXBlb2YgcHJvY2VzcyAhPT0gJ3VuZGVmaW5lZCcgJiYgT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHByb2Nlc3MpID09PSAnW29iamVjdCBwcm9jZXNzXScpIHtcbiAgICAvLyBGb3Igbm9kZSB1c2UgSFRUUCBhZGFwdGVyXG4gICAgYWRhcHRlciA9IHJlcXVpcmUoJy4vYWRhcHRlcnMvaHR0cCcpO1xuICB9XG4gIHJldHVybiBhZGFwdGVyO1xufVxuXG52YXIgZGVmYXVsdHMgPSB7XG4gIGFkYXB0ZXI6IGdldERlZmF1bHRBZGFwdGVyKCksXG5cbiAgdHJhbnNmb3JtUmVxdWVzdDogW2Z1bmN0aW9uIHRyYW5zZm9ybVJlcXVlc3QoZGF0YSwgaGVhZGVycykge1xuICAgIG5vcm1hbGl6ZUhlYWRlck5hbWUoaGVhZGVycywgJ0FjY2VwdCcpO1xuICAgIG5vcm1hbGl6ZUhlYWRlck5hbWUoaGVhZGVycywgJ0NvbnRlbnQtVHlwZScpO1xuICAgIGlmICh1dGlscy5pc0Zvcm1EYXRhKGRhdGEpIHx8XG4gICAgICB1dGlscy5pc0FycmF5QnVmZmVyKGRhdGEpIHx8XG4gICAgICB1dGlscy5pc0J1ZmZlcihkYXRhKSB8fFxuICAgICAgdXRpbHMuaXNTdHJlYW0oZGF0YSkgfHxcbiAgICAgIHV0aWxzLmlzRmlsZShkYXRhKSB8fFxuICAgICAgdXRpbHMuaXNCbG9iKGRhdGEpXG4gICAgKSB7XG4gICAgICByZXR1cm4gZGF0YTtcbiAgICB9XG4gICAgaWYgKHV0aWxzLmlzQXJyYXlCdWZmZXJWaWV3KGRhdGEpKSB7XG4gICAgICByZXR1cm4gZGF0YS5idWZmZXI7XG4gICAgfVxuICAgIGlmICh1dGlscy5pc1VSTFNlYXJjaFBhcmFtcyhkYXRhKSkge1xuICAgICAgc2V0Q29udGVudFR5cGVJZlVuc2V0KGhlYWRlcnMsICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQ7Y2hhcnNldD11dGYtOCcpO1xuICAgICAgcmV0dXJuIGRhdGEudG9TdHJpbmcoKTtcbiAgICB9XG4gICAgaWYgKHV0aWxzLmlzT2JqZWN0KGRhdGEpKSB7XG4gICAgICBzZXRDb250ZW50VHlwZUlmVW5zZXQoaGVhZGVycywgJ2FwcGxpY2F0aW9uL2pzb247Y2hhcnNldD11dGYtOCcpO1xuICAgICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KGRhdGEpO1xuICAgIH1cbiAgICByZXR1cm4gZGF0YTtcbiAgfV0sXG5cbiAgdHJhbnNmb3JtUmVzcG9uc2U6IFtmdW5jdGlvbiB0cmFuc2Zvcm1SZXNwb25zZShkYXRhKSB7XG4gICAgLyplc2xpbnQgbm8tcGFyYW0tcmVhc3NpZ246MCovXG4gICAgaWYgKHR5cGVvZiBkYXRhID09PSAnc3RyaW5nJykge1xuICAgICAgdHJ5IHtcbiAgICAgICAgZGF0YSA9IEpTT04ucGFyc2UoZGF0YSk7XG4gICAgICB9IGNhdGNoIChlKSB7IC8qIElnbm9yZSAqLyB9XG4gICAgfVxuICAgIHJldHVybiBkYXRhO1xuICB9XSxcblxuICAvKipcbiAgICogQSB0aW1lb3V0IGluIG1pbGxpc2Vjb25kcyB0byBhYm9ydCBhIHJlcXVlc3QuIElmIHNldCB0byAwIChkZWZhdWx0KSBhXG4gICAqIHRpbWVvdXQgaXMgbm90IGNyZWF0ZWQuXG4gICAqL1xuICB0aW1lb3V0OiAwLFxuXG4gIHhzcmZDb29raWVOYW1lOiAnWFNSRi1UT0tFTicsXG4gIHhzcmZIZWFkZXJOYW1lOiAnWC1YU1JGLVRPS0VOJyxcblxuICBtYXhDb250ZW50TGVuZ3RoOiAtMSxcbiAgbWF4Qm9keUxlbmd0aDogLTEsXG5cbiAgdmFsaWRhdGVTdGF0dXM6IGZ1bmN0aW9uIHZhbGlkYXRlU3RhdHVzKHN0YXR1cykge1xuICAgIHJldHVybiBzdGF0dXMgPj0gMjAwICYmIHN0YXR1cyA8IDMwMDtcbiAgfVxufTtcblxuZGVmYXVsdHMuaGVhZGVycyA9IHtcbiAgY29tbW9uOiB7XG4gICAgJ0FjY2VwdCc6ICdhcHBsaWNhdGlvbi9qc29uLCB0ZXh0L3BsYWluLCAqLyonXG4gIH1cbn07XG5cbnV0aWxzLmZvckVhY2goWydkZWxldGUnLCAnZ2V0JywgJ2hlYWQnXSwgZnVuY3Rpb24gZm9yRWFjaE1ldGhvZE5vRGF0YShtZXRob2QpIHtcbiAgZGVmYXVsdHMuaGVhZGVyc1ttZXRob2RdID0ge307XG59KTtcblxudXRpbHMuZm9yRWFjaChbJ3Bvc3QnLCAncHV0JywgJ3BhdGNoJ10sIGZ1bmN0aW9uIGZvckVhY2hNZXRob2RXaXRoRGF0YShtZXRob2QpIHtcbiAgZGVmYXVsdHMuaGVhZGVyc1ttZXRob2RdID0gdXRpbHMubWVyZ2UoREVGQVVMVF9DT05URU5UX1RZUEUpO1xufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gZGVmYXVsdHM7XG4iLCIndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gYmluZChmbiwgdGhpc0FyZykge1xuICByZXR1cm4gZnVuY3Rpb24gd3JhcCgpIHtcbiAgICB2YXIgYXJncyA9IG5ldyBBcnJheShhcmd1bWVudHMubGVuZ3RoKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFyZ3MubGVuZ3RoOyBpKyspIHtcbiAgICAgIGFyZ3NbaV0gPSBhcmd1bWVudHNbaV07XG4gICAgfVxuICAgIHJldHVybiBmbi5hcHBseSh0aGlzQXJnLCBhcmdzKTtcbiAgfTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcblxuZnVuY3Rpb24gZW5jb2RlKHZhbCkge1xuICByZXR1cm4gZW5jb2RlVVJJQ29tcG9uZW50KHZhbCkuXG4gICAgcmVwbGFjZSgvJTNBL2dpLCAnOicpLlxuICAgIHJlcGxhY2UoLyUyNC9nLCAnJCcpLlxuICAgIHJlcGxhY2UoLyUyQy9naSwgJywnKS5cbiAgICByZXBsYWNlKC8lMjAvZywgJysnKS5cbiAgICByZXBsYWNlKC8lNUIvZ2ksICdbJykuXG4gICAgcmVwbGFjZSgvJTVEL2dpLCAnXScpO1xufVxuXG4vKipcbiAqIEJ1aWxkIGEgVVJMIGJ5IGFwcGVuZGluZyBwYXJhbXMgdG8gdGhlIGVuZFxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSB1cmwgVGhlIGJhc2Ugb2YgdGhlIHVybCAoZS5nLiwgaHR0cDovL3d3dy5nb29nbGUuY29tKVxuICogQHBhcmFtIHtvYmplY3R9IFtwYXJhbXNdIFRoZSBwYXJhbXMgdG8gYmUgYXBwZW5kZWRcbiAqIEByZXR1cm5zIHtzdHJpbmd9IFRoZSBmb3JtYXR0ZWQgdXJsXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gYnVpbGRVUkwodXJsLCBwYXJhbXMsIHBhcmFtc1NlcmlhbGl6ZXIpIHtcbiAgLyplc2xpbnQgbm8tcGFyYW0tcmVhc3NpZ246MCovXG4gIGlmICghcGFyYW1zKSB7XG4gICAgcmV0dXJuIHVybDtcbiAgfVxuXG4gIHZhciBzZXJpYWxpemVkUGFyYW1zO1xuICBpZiAocGFyYW1zU2VyaWFsaXplcikge1xuICAgIHNlcmlhbGl6ZWRQYXJhbXMgPSBwYXJhbXNTZXJpYWxpemVyKHBhcmFtcyk7XG4gIH0gZWxzZSBpZiAodXRpbHMuaXNVUkxTZWFyY2hQYXJhbXMocGFyYW1zKSkge1xuICAgIHNlcmlhbGl6ZWRQYXJhbXMgPSBwYXJhbXMudG9TdHJpbmcoKTtcbiAgfSBlbHNlIHtcbiAgICB2YXIgcGFydHMgPSBbXTtcblxuICAgIHV0aWxzLmZvckVhY2gocGFyYW1zLCBmdW5jdGlvbiBzZXJpYWxpemUodmFsLCBrZXkpIHtcbiAgICAgIGlmICh2YWwgPT09IG51bGwgfHwgdHlwZW9mIHZhbCA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBpZiAodXRpbHMuaXNBcnJheSh2YWwpKSB7XG4gICAgICAgIGtleSA9IGtleSArICdbXSc7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YWwgPSBbdmFsXTtcbiAgICAgIH1cblxuICAgICAgdXRpbHMuZm9yRWFjaCh2YWwsIGZ1bmN0aW9uIHBhcnNlVmFsdWUodikge1xuICAgICAgICBpZiAodXRpbHMuaXNEYXRlKHYpKSB7XG4gICAgICAgICAgdiA9IHYudG9JU09TdHJpbmcoKTtcbiAgICAgICAgfSBlbHNlIGlmICh1dGlscy5pc09iamVjdCh2KSkge1xuICAgICAgICAgIHYgPSBKU09OLnN0cmluZ2lmeSh2KTtcbiAgICAgICAgfVxuICAgICAgICBwYXJ0cy5wdXNoKGVuY29kZShrZXkpICsgJz0nICsgZW5jb2RlKHYpKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgc2VyaWFsaXplZFBhcmFtcyA9IHBhcnRzLmpvaW4oJyYnKTtcbiAgfVxuXG4gIGlmIChzZXJpYWxpemVkUGFyYW1zKSB7XG4gICAgdmFyIGhhc2htYXJrSW5kZXggPSB1cmwuaW5kZXhPZignIycpO1xuICAgIGlmIChoYXNobWFya0luZGV4ICE9PSAtMSkge1xuICAgICAgdXJsID0gdXJsLnNsaWNlKDAsIGhhc2htYXJrSW5kZXgpO1xuICAgIH1cblxuICAgIHVybCArPSAodXJsLmluZGV4T2YoJz8nKSA9PT0gLTEgPyAnPycgOiAnJicpICsgc2VyaWFsaXplZFBhcmFtcztcbiAgfVxuXG4gIHJldHVybiB1cmw7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgVVJMIGJ5IGNvbWJpbmluZyB0aGUgc3BlY2lmaWVkIFVSTHNcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gYmFzZVVSTCBUaGUgYmFzZSBVUkxcbiAqIEBwYXJhbSB7c3RyaW5nfSByZWxhdGl2ZVVSTCBUaGUgcmVsYXRpdmUgVVJMXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBUaGUgY29tYmluZWQgVVJMXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gY29tYmluZVVSTHMoYmFzZVVSTCwgcmVsYXRpdmVVUkwpIHtcbiAgcmV0dXJuIHJlbGF0aXZlVVJMXG4gICAgPyBiYXNlVVJMLnJlcGxhY2UoL1xcLyskLywgJycpICsgJy8nICsgcmVsYXRpdmVVUkwucmVwbGFjZSgvXlxcLysvLCAnJylcbiAgICA6IGJhc2VVUkw7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gKFxuICB1dGlscy5pc1N0YW5kYXJkQnJvd3NlckVudigpID9cblxuICAvLyBTdGFuZGFyZCBicm93c2VyIGVudnMgc3VwcG9ydCBkb2N1bWVudC5jb29raWVcbiAgICAoZnVuY3Rpb24gc3RhbmRhcmRCcm93c2VyRW52KCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgd3JpdGU6IGZ1bmN0aW9uIHdyaXRlKG5hbWUsIHZhbHVlLCBleHBpcmVzLCBwYXRoLCBkb21haW4sIHNlY3VyZSkge1xuICAgICAgICAgIHZhciBjb29raWUgPSBbXTtcbiAgICAgICAgICBjb29raWUucHVzaChuYW1lICsgJz0nICsgZW5jb2RlVVJJQ29tcG9uZW50KHZhbHVlKSk7XG5cbiAgICAgICAgICBpZiAodXRpbHMuaXNOdW1iZXIoZXhwaXJlcykpIHtcbiAgICAgICAgICAgIGNvb2tpZS5wdXNoKCdleHBpcmVzPScgKyBuZXcgRGF0ZShleHBpcmVzKS50b0dNVFN0cmluZygpKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAodXRpbHMuaXNTdHJpbmcocGF0aCkpIHtcbiAgICAgICAgICAgIGNvb2tpZS5wdXNoKCdwYXRoPScgKyBwYXRoKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAodXRpbHMuaXNTdHJpbmcoZG9tYWluKSkge1xuICAgICAgICAgICAgY29va2llLnB1c2goJ2RvbWFpbj0nICsgZG9tYWluKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoc2VjdXJlID09PSB0cnVlKSB7XG4gICAgICAgICAgICBjb29raWUucHVzaCgnc2VjdXJlJyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgZG9jdW1lbnQuY29va2llID0gY29va2llLmpvaW4oJzsgJyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgcmVhZDogZnVuY3Rpb24gcmVhZChuYW1lKSB7XG4gICAgICAgICAgdmFyIG1hdGNoID0gZG9jdW1lbnQuY29va2llLm1hdGNoKG5ldyBSZWdFeHAoJyhefDtcXFxccyopKCcgKyBuYW1lICsgJyk9KFteO10qKScpKTtcbiAgICAgICAgICByZXR1cm4gKG1hdGNoID8gZGVjb2RlVVJJQ29tcG9uZW50KG1hdGNoWzNdKSA6IG51bGwpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHJlbW92ZTogZnVuY3Rpb24gcmVtb3ZlKG5hbWUpIHtcbiAgICAgICAgICB0aGlzLndyaXRlKG5hbWUsICcnLCBEYXRlLm5vdygpIC0gODY0MDAwMDApO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgIH0pKCkgOlxuXG4gIC8vIE5vbiBzdGFuZGFyZCBicm93c2VyIGVudiAod2ViIHdvcmtlcnMsIHJlYWN0LW5hdGl2ZSkgbGFjayBuZWVkZWQgc3VwcG9ydC5cbiAgICAoZnVuY3Rpb24gbm9uU3RhbmRhcmRCcm93c2VyRW52KCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgd3JpdGU6IGZ1bmN0aW9uIHdyaXRlKCkge30sXG4gICAgICAgIHJlYWQ6IGZ1bmN0aW9uIHJlYWQoKSB7IHJldHVybiBudWxsOyB9LFxuICAgICAgICByZW1vdmU6IGZ1bmN0aW9uIHJlbW92ZSgpIHt9XG4gICAgICB9O1xuICAgIH0pKClcbik7XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogRGV0ZXJtaW5lcyB3aGV0aGVyIHRoZSBzcGVjaWZpZWQgVVJMIGlzIGFic29sdXRlXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHVybCBUaGUgVVJMIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHRoZSBzcGVjaWZpZWQgVVJMIGlzIGFic29sdXRlLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBpc0Fic29sdXRlVVJMKHVybCkge1xuICAvLyBBIFVSTCBpcyBjb25zaWRlcmVkIGFic29sdXRlIGlmIGl0IGJlZ2lucyB3aXRoIFwiPHNjaGVtZT46Ly9cIiBvciBcIi8vXCIgKHByb3RvY29sLXJlbGF0aXZlIFVSTCkuXG4gIC8vIFJGQyAzOTg2IGRlZmluZXMgc2NoZW1lIG5hbWUgYXMgYSBzZXF1ZW5jZSBvZiBjaGFyYWN0ZXJzIGJlZ2lubmluZyB3aXRoIGEgbGV0dGVyIGFuZCBmb2xsb3dlZFxuICAvLyBieSBhbnkgY29tYmluYXRpb24gb2YgbGV0dGVycywgZGlnaXRzLCBwbHVzLCBwZXJpb2QsIG9yIGh5cGhlbi5cbiAgcmV0dXJuIC9eKFthLXpdW2EtelxcZFxcK1xcLVxcLl0qOik/XFwvXFwvL2kudGVzdCh1cmwpO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IChcbiAgdXRpbHMuaXNTdGFuZGFyZEJyb3dzZXJFbnYoKSA/XG5cbiAgLy8gU3RhbmRhcmQgYnJvd3NlciBlbnZzIGhhdmUgZnVsbCBzdXBwb3J0IG9mIHRoZSBBUElzIG5lZWRlZCB0byB0ZXN0XG4gIC8vIHdoZXRoZXIgdGhlIHJlcXVlc3QgVVJMIGlzIG9mIHRoZSBzYW1lIG9yaWdpbiBhcyBjdXJyZW50IGxvY2F0aW9uLlxuICAgIChmdW5jdGlvbiBzdGFuZGFyZEJyb3dzZXJFbnYoKSB7XG4gICAgICB2YXIgbXNpZSA9IC8obXNpZXx0cmlkZW50KS9pLnRlc3QobmF2aWdhdG9yLnVzZXJBZ2VudCk7XG4gICAgICB2YXIgdXJsUGFyc2luZ05vZGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJyk7XG4gICAgICB2YXIgb3JpZ2luVVJMO1xuXG4gICAgICAvKipcbiAgICAqIFBhcnNlIGEgVVJMIHRvIGRpc2NvdmVyIGl0J3MgY29tcG9uZW50c1xuICAgICpcbiAgICAqIEBwYXJhbSB7U3RyaW5nfSB1cmwgVGhlIFVSTCB0byBiZSBwYXJzZWRcbiAgICAqIEByZXR1cm5zIHtPYmplY3R9XG4gICAgKi9cbiAgICAgIGZ1bmN0aW9uIHJlc29sdmVVUkwodXJsKSB7XG4gICAgICAgIHZhciBocmVmID0gdXJsO1xuXG4gICAgICAgIGlmIChtc2llKSB7XG4gICAgICAgIC8vIElFIG5lZWRzIGF0dHJpYnV0ZSBzZXQgdHdpY2UgdG8gbm9ybWFsaXplIHByb3BlcnRpZXNcbiAgICAgICAgICB1cmxQYXJzaW5nTm9kZS5zZXRBdHRyaWJ1dGUoJ2hyZWYnLCBocmVmKTtcbiAgICAgICAgICBocmVmID0gdXJsUGFyc2luZ05vZGUuaHJlZjtcbiAgICAgICAgfVxuXG4gICAgICAgIHVybFBhcnNpbmdOb2RlLnNldEF0dHJpYnV0ZSgnaHJlZicsIGhyZWYpO1xuXG4gICAgICAgIC8vIHVybFBhcnNpbmdOb2RlIHByb3ZpZGVzIHRoZSBVcmxVdGlscyBpbnRlcmZhY2UgLSBodHRwOi8vdXJsLnNwZWMud2hhdHdnLm9yZy8jdXJsdXRpbHNcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBocmVmOiB1cmxQYXJzaW5nTm9kZS5ocmVmLFxuICAgICAgICAgIHByb3RvY29sOiB1cmxQYXJzaW5nTm9kZS5wcm90b2NvbCA/IHVybFBhcnNpbmdOb2RlLnByb3RvY29sLnJlcGxhY2UoLzokLywgJycpIDogJycsXG4gICAgICAgICAgaG9zdDogdXJsUGFyc2luZ05vZGUuaG9zdCxcbiAgICAgICAgICBzZWFyY2g6IHVybFBhcnNpbmdOb2RlLnNlYXJjaCA/IHVybFBhcnNpbmdOb2RlLnNlYXJjaC5yZXBsYWNlKC9eXFw/LywgJycpIDogJycsXG4gICAgICAgICAgaGFzaDogdXJsUGFyc2luZ05vZGUuaGFzaCA/IHVybFBhcnNpbmdOb2RlLmhhc2gucmVwbGFjZSgvXiMvLCAnJykgOiAnJyxcbiAgICAgICAgICBob3N0bmFtZTogdXJsUGFyc2luZ05vZGUuaG9zdG5hbWUsXG4gICAgICAgICAgcG9ydDogdXJsUGFyc2luZ05vZGUucG9ydCxcbiAgICAgICAgICBwYXRobmFtZTogKHVybFBhcnNpbmdOb2RlLnBhdGhuYW1lLmNoYXJBdCgwKSA9PT0gJy8nKSA/XG4gICAgICAgICAgICB1cmxQYXJzaW5nTm9kZS5wYXRobmFtZSA6XG4gICAgICAgICAgICAnLycgKyB1cmxQYXJzaW5nTm9kZS5wYXRobmFtZVxuICAgICAgICB9O1xuICAgICAgfVxuXG4gICAgICBvcmlnaW5VUkwgPSByZXNvbHZlVVJMKHdpbmRvdy5sb2NhdGlvbi5ocmVmKTtcblxuICAgICAgLyoqXG4gICAgKiBEZXRlcm1pbmUgaWYgYSBVUkwgc2hhcmVzIHRoZSBzYW1lIG9yaWdpbiBhcyB0aGUgY3VycmVudCBsb2NhdGlvblxuICAgICpcbiAgICAqIEBwYXJhbSB7U3RyaW5nfSByZXF1ZXN0VVJMIFRoZSBVUkwgdG8gdGVzdFxuICAgICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgVVJMIHNoYXJlcyB0aGUgc2FtZSBvcmlnaW4sIG90aGVyd2lzZSBmYWxzZVxuICAgICovXG4gICAgICByZXR1cm4gZnVuY3Rpb24gaXNVUkxTYW1lT3JpZ2luKHJlcXVlc3RVUkwpIHtcbiAgICAgICAgdmFyIHBhcnNlZCA9ICh1dGlscy5pc1N0cmluZyhyZXF1ZXN0VVJMKSkgPyByZXNvbHZlVVJMKHJlcXVlc3RVUkwpIDogcmVxdWVzdFVSTDtcbiAgICAgICAgcmV0dXJuIChwYXJzZWQucHJvdG9jb2wgPT09IG9yaWdpblVSTC5wcm90b2NvbCAmJlxuICAgICAgICAgICAgcGFyc2VkLmhvc3QgPT09IG9yaWdpblVSTC5ob3N0KTtcbiAgICAgIH07XG4gICAgfSkoKSA6XG5cbiAgLy8gTm9uIHN0YW5kYXJkIGJyb3dzZXIgZW52cyAod2ViIHdvcmtlcnMsIHJlYWN0LW5hdGl2ZSkgbGFjayBuZWVkZWQgc3VwcG9ydC5cbiAgICAoZnVuY3Rpb24gbm9uU3RhbmRhcmRCcm93c2VyRW52KCkge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uIGlzVVJMU2FtZU9yaWdpbigpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9O1xuICAgIH0pKClcbik7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4uL3V0aWxzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gbm9ybWFsaXplSGVhZGVyTmFtZShoZWFkZXJzLCBub3JtYWxpemVkTmFtZSkge1xuICB1dGlscy5mb3JFYWNoKGhlYWRlcnMsIGZ1bmN0aW9uIHByb2Nlc3NIZWFkZXIodmFsdWUsIG5hbWUpIHtcbiAgICBpZiAobmFtZSAhPT0gbm9ybWFsaXplZE5hbWUgJiYgbmFtZS50b1VwcGVyQ2FzZSgpID09PSBub3JtYWxpemVkTmFtZS50b1VwcGVyQ2FzZSgpKSB7XG4gICAgICBoZWFkZXJzW25vcm1hbGl6ZWROYW1lXSA9IHZhbHVlO1xuICAgICAgZGVsZXRlIGhlYWRlcnNbbmFtZV07XG4gICAgfVxuICB9KTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcblxuLy8gSGVhZGVycyB3aG9zZSBkdXBsaWNhdGVzIGFyZSBpZ25vcmVkIGJ5IG5vZGVcbi8vIGMuZi4gaHR0cHM6Ly9ub2RlanMub3JnL2FwaS9odHRwLmh0bWwjaHR0cF9tZXNzYWdlX2hlYWRlcnNcbnZhciBpZ25vcmVEdXBsaWNhdGVPZiA9IFtcbiAgJ2FnZScsICdhdXRob3JpemF0aW9uJywgJ2NvbnRlbnQtbGVuZ3RoJywgJ2NvbnRlbnQtdHlwZScsICdldGFnJyxcbiAgJ2V4cGlyZXMnLCAnZnJvbScsICdob3N0JywgJ2lmLW1vZGlmaWVkLXNpbmNlJywgJ2lmLXVubW9kaWZpZWQtc2luY2UnLFxuICAnbGFzdC1tb2RpZmllZCcsICdsb2NhdGlvbicsICdtYXgtZm9yd2FyZHMnLCAncHJveHktYXV0aG9yaXphdGlvbicsXG4gICdyZWZlcmVyJywgJ3JldHJ5LWFmdGVyJywgJ3VzZXItYWdlbnQnXG5dO1xuXG4vKipcbiAqIFBhcnNlIGhlYWRlcnMgaW50byBhbiBvYmplY3RcbiAqXG4gKiBgYGBcbiAqIERhdGU6IFdlZCwgMjcgQXVnIDIwMTQgMDg6NTg6NDkgR01UXG4gKiBDb250ZW50LVR5cGU6IGFwcGxpY2F0aW9uL2pzb25cbiAqIENvbm5lY3Rpb246IGtlZXAtYWxpdmVcbiAqIFRyYW5zZmVyLUVuY29kaW5nOiBjaHVua2VkXG4gKiBgYGBcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gaGVhZGVycyBIZWFkZXJzIG5lZWRpbmcgdG8gYmUgcGFyc2VkXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBIZWFkZXJzIHBhcnNlZCBpbnRvIGFuIG9iamVjdFxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHBhcnNlSGVhZGVycyhoZWFkZXJzKSB7XG4gIHZhciBwYXJzZWQgPSB7fTtcbiAgdmFyIGtleTtcbiAgdmFyIHZhbDtcbiAgdmFyIGk7XG5cbiAgaWYgKCFoZWFkZXJzKSB7IHJldHVybiBwYXJzZWQ7IH1cblxuICB1dGlscy5mb3JFYWNoKGhlYWRlcnMuc3BsaXQoJ1xcbicpLCBmdW5jdGlvbiBwYXJzZXIobGluZSkge1xuICAgIGkgPSBsaW5lLmluZGV4T2YoJzonKTtcbiAgICBrZXkgPSB1dGlscy50cmltKGxpbmUuc3Vic3RyKDAsIGkpKS50b0xvd2VyQ2FzZSgpO1xuICAgIHZhbCA9IHV0aWxzLnRyaW0obGluZS5zdWJzdHIoaSArIDEpKTtcblxuICAgIGlmIChrZXkpIHtcbiAgICAgIGlmIChwYXJzZWRba2V5XSAmJiBpZ25vcmVEdXBsaWNhdGVPZi5pbmRleE9mKGtleSkgPj0gMCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBpZiAoa2V5ID09PSAnc2V0LWNvb2tpZScpIHtcbiAgICAgICAgcGFyc2VkW2tleV0gPSAocGFyc2VkW2tleV0gPyBwYXJzZWRba2V5XSA6IFtdKS5jb25jYXQoW3ZhbF0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcGFyc2VkW2tleV0gPSBwYXJzZWRba2V5XSA/IHBhcnNlZFtrZXldICsgJywgJyArIHZhbCA6IHZhbDtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiBwYXJzZWQ7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIFN5bnRhY3RpYyBzdWdhciBmb3IgaW52b2tpbmcgYSBmdW5jdGlvbiBhbmQgZXhwYW5kaW5nIGFuIGFycmF5IGZvciBhcmd1bWVudHMuXG4gKlxuICogQ29tbW9uIHVzZSBjYXNlIHdvdWxkIGJlIHRvIHVzZSBgRnVuY3Rpb24ucHJvdG90eXBlLmFwcGx5YC5cbiAqXG4gKiAgYGBganNcbiAqICBmdW5jdGlvbiBmKHgsIHksIHopIHt9XG4gKiAgdmFyIGFyZ3MgPSBbMSwgMiwgM107XG4gKiAgZi5hcHBseShudWxsLCBhcmdzKTtcbiAqICBgYGBcbiAqXG4gKiBXaXRoIGBzcHJlYWRgIHRoaXMgZXhhbXBsZSBjYW4gYmUgcmUtd3JpdHRlbi5cbiAqXG4gKiAgYGBganNcbiAqICBzcHJlYWQoZnVuY3Rpb24oeCwgeSwgeikge30pKFsxLCAyLCAzXSk7XG4gKiAgYGBgXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2tcbiAqIEByZXR1cm5zIHtGdW5jdGlvbn1cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBzcHJlYWQoY2FsbGJhY2spIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIHdyYXAoYXJyKSB7XG4gICAgcmV0dXJuIGNhbGxiYWNrLmFwcGx5KG51bGwsIGFycik7XG4gIH07XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgYmluZCA9IHJlcXVpcmUoJy4vaGVscGVycy9iaW5kJyk7XG5cbi8qZ2xvYmFsIHRvU3RyaW5nOnRydWUqL1xuXG4vLyB1dGlscyBpcyBhIGxpYnJhcnkgb2YgZ2VuZXJpYyBoZWxwZXIgZnVuY3Rpb25zIG5vbi1zcGVjaWZpYyB0byBheGlvc1xuXG52YXIgdG9TdHJpbmcgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nO1xuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGFuIEFycmF5XG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYW4gQXJyYXksIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0FycmF5KHZhbCkge1xuICByZXR1cm4gdG9TdHJpbmcuY2FsbCh2YWwpID09PSAnW29iamVjdCBBcnJheV0nO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIHVuZGVmaW5lZFxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHRoZSB2YWx1ZSBpcyB1bmRlZmluZWQsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc1VuZGVmaW5lZCh2YWwpIHtcbiAgcmV0dXJuIHR5cGVvZiB2YWwgPT09ICd1bmRlZmluZWQnO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgQnVmZmVyXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSBCdWZmZXIsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0J1ZmZlcih2YWwpIHtcbiAgcmV0dXJuIHZhbCAhPT0gbnVsbCAmJiAhaXNVbmRlZmluZWQodmFsKSAmJiB2YWwuY29uc3RydWN0b3IgIT09IG51bGwgJiYgIWlzVW5kZWZpbmVkKHZhbC5jb25zdHJ1Y3RvcilcbiAgICAmJiB0eXBlb2YgdmFsLmNvbnN0cnVjdG9yLmlzQnVmZmVyID09PSAnZnVuY3Rpb24nICYmIHZhbC5jb25zdHJ1Y3Rvci5pc0J1ZmZlcih2YWwpO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGFuIEFycmF5QnVmZmVyXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYW4gQXJyYXlCdWZmZXIsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0FycmF5QnVmZmVyKHZhbCkge1xuICByZXR1cm4gdG9TdHJpbmcuY2FsbCh2YWwpID09PSAnW29iamVjdCBBcnJheUJ1ZmZlcl0nO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgRm9ybURhdGFcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhbiBGb3JtRGF0YSwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzRm9ybURhdGEodmFsKSB7XG4gIHJldHVybiAodHlwZW9mIEZvcm1EYXRhICE9PSAndW5kZWZpbmVkJykgJiYgKHZhbCBpbnN0YW5jZW9mIEZvcm1EYXRhKTtcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIHZpZXcgb24gYW4gQXJyYXlCdWZmZXJcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIHZpZXcgb24gYW4gQXJyYXlCdWZmZXIsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0FycmF5QnVmZmVyVmlldyh2YWwpIHtcbiAgdmFyIHJlc3VsdDtcbiAgaWYgKCh0eXBlb2YgQXJyYXlCdWZmZXIgIT09ICd1bmRlZmluZWQnKSAmJiAoQXJyYXlCdWZmZXIuaXNWaWV3KSkge1xuICAgIHJlc3VsdCA9IEFycmF5QnVmZmVyLmlzVmlldyh2YWwpO1xuICB9IGVsc2Uge1xuICAgIHJlc3VsdCA9ICh2YWwpICYmICh2YWwuYnVmZmVyKSAmJiAodmFsLmJ1ZmZlciBpbnN0YW5jZW9mIEFycmF5QnVmZmVyKTtcbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgU3RyaW5nXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSBTdHJpbmcsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc1N0cmluZyh2YWwpIHtcbiAgcmV0dXJuIHR5cGVvZiB2YWwgPT09ICdzdHJpbmcnO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgTnVtYmVyXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSBOdW1iZXIsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc051bWJlcih2YWwpIHtcbiAgcmV0dXJuIHR5cGVvZiB2YWwgPT09ICdudW1iZXInO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGFuIE9iamVjdFxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGFuIE9iamVjdCwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzT2JqZWN0KHZhbCkge1xuICByZXR1cm4gdmFsICE9PSBudWxsICYmIHR5cGVvZiB2YWwgPT09ICdvYmplY3QnO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgcGxhaW4gT2JqZWN0XG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybiB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIHBsYWluIE9iamVjdCwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzUGxhaW5PYmplY3QodmFsKSB7XG4gIGlmICh0b1N0cmluZy5jYWxsKHZhbCkgIT09ICdbb2JqZWN0IE9iamVjdF0nKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgdmFyIHByb3RvdHlwZSA9IE9iamVjdC5nZXRQcm90b3R5cGVPZih2YWwpO1xuICByZXR1cm4gcHJvdG90eXBlID09PSBudWxsIHx8IHByb3RvdHlwZSA9PT0gT2JqZWN0LnByb3RvdHlwZTtcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIERhdGVcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIERhdGUsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0RhdGUodmFsKSB7XG4gIHJldHVybiB0b1N0cmluZy5jYWxsKHZhbCkgPT09ICdbb2JqZWN0IERhdGVdJztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIEZpbGVcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIEZpbGUsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0ZpbGUodmFsKSB7XG4gIHJldHVybiB0b1N0cmluZy5jYWxsKHZhbCkgPT09ICdbb2JqZWN0IEZpbGVdJztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIEJsb2JcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIEJsb2IsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0Jsb2IodmFsKSB7XG4gIHJldHVybiB0b1N0cmluZy5jYWxsKHZhbCkgPT09ICdbb2JqZWN0IEJsb2JdJztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIEZ1bmN0aW9uXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSBGdW5jdGlvbiwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzRnVuY3Rpb24odmFsKSB7XG4gIHJldHVybiB0b1N0cmluZy5jYWxsKHZhbCkgPT09ICdbb2JqZWN0IEZ1bmN0aW9uXSc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBTdHJlYW1cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIFN0cmVhbSwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzU3RyZWFtKHZhbCkge1xuICByZXR1cm4gaXNPYmplY3QodmFsKSAmJiBpc0Z1bmN0aW9uKHZhbC5waXBlKTtcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIFVSTFNlYXJjaFBhcmFtcyBvYmplY3RcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIFVSTFNlYXJjaFBhcmFtcyBvYmplY3QsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc1VSTFNlYXJjaFBhcmFtcyh2YWwpIHtcbiAgcmV0dXJuIHR5cGVvZiBVUkxTZWFyY2hQYXJhbXMgIT09ICd1bmRlZmluZWQnICYmIHZhbCBpbnN0YW5jZW9mIFVSTFNlYXJjaFBhcmFtcztcbn1cblxuLyoqXG4gKiBUcmltIGV4Y2VzcyB3aGl0ZXNwYWNlIG9mZiB0aGUgYmVnaW5uaW5nIGFuZCBlbmQgb2YgYSBzdHJpbmdcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyIFRoZSBTdHJpbmcgdG8gdHJpbVxuICogQHJldHVybnMge1N0cmluZ30gVGhlIFN0cmluZyBmcmVlZCBvZiBleGNlc3Mgd2hpdGVzcGFjZVxuICovXG5mdW5jdGlvbiB0cmltKHN0cikge1xuICByZXR1cm4gc3RyLnJlcGxhY2UoL15cXHMqLywgJycpLnJlcGxhY2UoL1xccyokLywgJycpO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiB3ZSdyZSBydW5uaW5nIGluIGEgc3RhbmRhcmQgYnJvd3NlciBlbnZpcm9ubWVudFxuICpcbiAqIFRoaXMgYWxsb3dzIGF4aW9zIHRvIHJ1biBpbiBhIHdlYiB3b3JrZXIsIGFuZCByZWFjdC1uYXRpdmUuXG4gKiBCb3RoIGVudmlyb25tZW50cyBzdXBwb3J0IFhNTEh0dHBSZXF1ZXN0LCBidXQgbm90IGZ1bGx5IHN0YW5kYXJkIGdsb2JhbHMuXG4gKlxuICogd2ViIHdvcmtlcnM6XG4gKiAgdHlwZW9mIHdpbmRvdyAtPiB1bmRlZmluZWRcbiAqICB0eXBlb2YgZG9jdW1lbnQgLT4gdW5kZWZpbmVkXG4gKlxuICogcmVhY3QtbmF0aXZlOlxuICogIG5hdmlnYXRvci5wcm9kdWN0IC0+ICdSZWFjdE5hdGl2ZSdcbiAqIG5hdGl2ZXNjcmlwdFxuICogIG5hdmlnYXRvci5wcm9kdWN0IC0+ICdOYXRpdmVTY3JpcHQnIG9yICdOUydcbiAqL1xuZnVuY3Rpb24gaXNTdGFuZGFyZEJyb3dzZXJFbnYoKSB7XG4gIGlmICh0eXBlb2YgbmF2aWdhdG9yICE9PSAndW5kZWZpbmVkJyAmJiAobmF2aWdhdG9yLnByb2R1Y3QgPT09ICdSZWFjdE5hdGl2ZScgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYXZpZ2F0b3IucHJvZHVjdCA9PT0gJ05hdGl2ZVNjcmlwdCcgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYXZpZ2F0b3IucHJvZHVjdCA9PT0gJ05TJykpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgcmV0dXJuIChcbiAgICB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyAmJlxuICAgIHR5cGVvZiBkb2N1bWVudCAhPT0gJ3VuZGVmaW5lZCdcbiAgKTtcbn1cblxuLyoqXG4gKiBJdGVyYXRlIG92ZXIgYW4gQXJyYXkgb3IgYW4gT2JqZWN0IGludm9raW5nIGEgZnVuY3Rpb24gZm9yIGVhY2ggaXRlbS5cbiAqXG4gKiBJZiBgb2JqYCBpcyBhbiBBcnJheSBjYWxsYmFjayB3aWxsIGJlIGNhbGxlZCBwYXNzaW5nXG4gKiB0aGUgdmFsdWUsIGluZGV4LCBhbmQgY29tcGxldGUgYXJyYXkgZm9yIGVhY2ggaXRlbS5cbiAqXG4gKiBJZiAnb2JqJyBpcyBhbiBPYmplY3QgY2FsbGJhY2sgd2lsbCBiZSBjYWxsZWQgcGFzc2luZ1xuICogdGhlIHZhbHVlLCBrZXksIGFuZCBjb21wbGV0ZSBvYmplY3QgZm9yIGVhY2ggcHJvcGVydHkuXG4gKlxuICogQHBhcmFtIHtPYmplY3R8QXJyYXl9IG9iaiBUaGUgb2JqZWN0IHRvIGl0ZXJhdGVcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuIFRoZSBjYWxsYmFjayB0byBpbnZva2UgZm9yIGVhY2ggaXRlbVxuICovXG5mdW5jdGlvbiBmb3JFYWNoKG9iaiwgZm4pIHtcbiAgLy8gRG9uJ3QgYm90aGVyIGlmIG5vIHZhbHVlIHByb3ZpZGVkXG4gIGlmIChvYmogPT09IG51bGwgfHwgdHlwZW9mIG9iaiA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICAvLyBGb3JjZSBhbiBhcnJheSBpZiBub3QgYWxyZWFkeSBzb21ldGhpbmcgaXRlcmFibGVcbiAgaWYgKHR5cGVvZiBvYmogIT09ICdvYmplY3QnKSB7XG4gICAgLyplc2xpbnQgbm8tcGFyYW0tcmVhc3NpZ246MCovXG4gICAgb2JqID0gW29ial07XG4gIH1cblxuICBpZiAoaXNBcnJheShvYmopKSB7XG4gICAgLy8gSXRlcmF0ZSBvdmVyIGFycmF5IHZhbHVlc1xuICAgIGZvciAodmFyIGkgPSAwLCBsID0gb2JqLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgZm4uY2FsbChudWxsLCBvYmpbaV0sIGksIG9iaik7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIC8vIEl0ZXJhdGUgb3ZlciBvYmplY3Qga2V5c1xuICAgIGZvciAodmFyIGtleSBpbiBvYmopIHtcbiAgICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBrZXkpKSB7XG4gICAgICAgIGZuLmNhbGwobnVsbCwgb2JqW2tleV0sIGtleSwgb2JqKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBBY2NlcHRzIHZhcmFyZ3MgZXhwZWN0aW5nIGVhY2ggYXJndW1lbnQgdG8gYmUgYW4gb2JqZWN0LCB0aGVuXG4gKiBpbW11dGFibHkgbWVyZ2VzIHRoZSBwcm9wZXJ0aWVzIG9mIGVhY2ggb2JqZWN0IGFuZCByZXR1cm5zIHJlc3VsdC5cbiAqXG4gKiBXaGVuIG11bHRpcGxlIG9iamVjdHMgY29udGFpbiB0aGUgc2FtZSBrZXkgdGhlIGxhdGVyIG9iamVjdCBpblxuICogdGhlIGFyZ3VtZW50cyBsaXN0IHdpbGwgdGFrZSBwcmVjZWRlbmNlLlxuICpcbiAqIEV4YW1wbGU6XG4gKlxuICogYGBganNcbiAqIHZhciByZXN1bHQgPSBtZXJnZSh7Zm9vOiAxMjN9LCB7Zm9vOiA0NTZ9KTtcbiAqIGNvbnNvbGUubG9nKHJlc3VsdC5mb28pOyAvLyBvdXRwdXRzIDQ1NlxuICogYGBgXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9iajEgT2JqZWN0IHRvIG1lcmdlXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBSZXN1bHQgb2YgYWxsIG1lcmdlIHByb3BlcnRpZXNcbiAqL1xuZnVuY3Rpb24gbWVyZ2UoLyogb2JqMSwgb2JqMiwgb2JqMywgLi4uICovKSB7XG4gIHZhciByZXN1bHQgPSB7fTtcbiAgZnVuY3Rpb24gYXNzaWduVmFsdWUodmFsLCBrZXkpIHtcbiAgICBpZiAoaXNQbGFpbk9iamVjdChyZXN1bHRba2V5XSkgJiYgaXNQbGFpbk9iamVjdCh2YWwpKSB7XG4gICAgICByZXN1bHRba2V5XSA9IG1lcmdlKHJlc3VsdFtrZXldLCB2YWwpO1xuICAgIH0gZWxzZSBpZiAoaXNQbGFpbk9iamVjdCh2YWwpKSB7XG4gICAgICByZXN1bHRba2V5XSA9IG1lcmdlKHt9LCB2YWwpO1xuICAgIH0gZWxzZSBpZiAoaXNBcnJheSh2YWwpKSB7XG4gICAgICByZXN1bHRba2V5XSA9IHZhbC5zbGljZSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXN1bHRba2V5XSA9IHZhbDtcbiAgICB9XG4gIH1cblxuICBmb3IgKHZhciBpID0gMCwgbCA9IGFyZ3VtZW50cy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICBmb3JFYWNoKGFyZ3VtZW50c1tpXSwgYXNzaWduVmFsdWUpO1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbi8qKlxuICogRXh0ZW5kcyBvYmplY3QgYSBieSBtdXRhYmx5IGFkZGluZyB0byBpdCB0aGUgcHJvcGVydGllcyBvZiBvYmplY3QgYi5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gYSBUaGUgb2JqZWN0IHRvIGJlIGV4dGVuZGVkXG4gKiBAcGFyYW0ge09iamVjdH0gYiBUaGUgb2JqZWN0IHRvIGNvcHkgcHJvcGVydGllcyBmcm9tXG4gKiBAcGFyYW0ge09iamVjdH0gdGhpc0FyZyBUaGUgb2JqZWN0IHRvIGJpbmQgZnVuY3Rpb24gdG9cbiAqIEByZXR1cm4ge09iamVjdH0gVGhlIHJlc3VsdGluZyB2YWx1ZSBvZiBvYmplY3QgYVxuICovXG5mdW5jdGlvbiBleHRlbmQoYSwgYiwgdGhpc0FyZykge1xuICBmb3JFYWNoKGIsIGZ1bmN0aW9uIGFzc2lnblZhbHVlKHZhbCwga2V5KSB7XG4gICAgaWYgKHRoaXNBcmcgJiYgdHlwZW9mIHZhbCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgYVtrZXldID0gYmluZCh2YWwsIHRoaXNBcmcpO1xuICAgIH0gZWxzZSB7XG4gICAgICBhW2tleV0gPSB2YWw7XG4gICAgfVxuICB9KTtcbiAgcmV0dXJuIGE7XG59XG5cbi8qKlxuICogUmVtb3ZlIGJ5dGUgb3JkZXIgbWFya2VyLiBUaGlzIGNhdGNoZXMgRUYgQkIgQkYgKHRoZSBVVEYtOCBCT00pXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IGNvbnRlbnQgd2l0aCBCT01cbiAqIEByZXR1cm4ge3N0cmluZ30gY29udGVudCB2YWx1ZSB3aXRob3V0IEJPTVxuICovXG5mdW5jdGlvbiBzdHJpcEJPTShjb250ZW50KSB7XG4gIGlmIChjb250ZW50LmNoYXJDb2RlQXQoMCkgPT09IDB4RkVGRikge1xuICAgIGNvbnRlbnQgPSBjb250ZW50LnNsaWNlKDEpO1xuICB9XG4gIHJldHVybiBjb250ZW50O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgaXNBcnJheTogaXNBcnJheSxcbiAgaXNBcnJheUJ1ZmZlcjogaXNBcnJheUJ1ZmZlcixcbiAgaXNCdWZmZXI6IGlzQnVmZmVyLFxuICBpc0Zvcm1EYXRhOiBpc0Zvcm1EYXRhLFxuICBpc0FycmF5QnVmZmVyVmlldzogaXNBcnJheUJ1ZmZlclZpZXcsXG4gIGlzU3RyaW5nOiBpc1N0cmluZyxcbiAgaXNOdW1iZXI6IGlzTnVtYmVyLFxuICBpc09iamVjdDogaXNPYmplY3QsXG4gIGlzUGxhaW5PYmplY3Q6IGlzUGxhaW5PYmplY3QsXG4gIGlzVW5kZWZpbmVkOiBpc1VuZGVmaW5lZCxcbiAgaXNEYXRlOiBpc0RhdGUsXG4gIGlzRmlsZTogaXNGaWxlLFxuICBpc0Jsb2I6IGlzQmxvYixcbiAgaXNGdW5jdGlvbjogaXNGdW5jdGlvbixcbiAgaXNTdHJlYW06IGlzU3RyZWFtLFxuICBpc1VSTFNlYXJjaFBhcmFtczogaXNVUkxTZWFyY2hQYXJhbXMsXG4gIGlzU3RhbmRhcmRCcm93c2VyRW52OiBpc1N0YW5kYXJkQnJvd3NlckVudixcbiAgZm9yRWFjaDogZm9yRWFjaCxcbiAgbWVyZ2U6IG1lcmdlLFxuICBleHRlbmQ6IGV4dGVuZCxcbiAgdHJpbTogdHJpbSxcbiAgc3RyaXBCT006IHN0cmlwQk9NXG59O1xuIiwiLy8gSW1wb3J0c1xuaW1wb3J0IF9fX0NTU19MT0FERVJfQVBJX1NPVVJDRU1BUF9JTVBPUlRfX18gZnJvbSBcIi4uLy4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2Rpc3QvcnVudGltZS9jc3NXaXRoTWFwcGluZ1RvU3RyaW5nLmpzXCI7XG5pbXBvcnQgX19fQ1NTX0xPQURFUl9BUElfSU1QT1JUX19fIGZyb20gXCIuLi8uLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L3J1bnRpbWUvYXBpLmpzXCI7XG52YXIgX19fQ1NTX0xPQURFUl9FWFBPUlRfX18gPSBfX19DU1NfTE9BREVSX0FQSV9JTVBPUlRfX18oX19fQ1NTX0xPQURFUl9BUElfU09VUkNFTUFQX0lNUE9SVF9fXyk7XG4vLyBNb2R1bGVcbl9fX0NTU19MT0FERVJfRVhQT1JUX19fLnB1c2goW21vZHVsZS5pZCwgXCIubm90eV9sYXlvdXRfbWl4aW4sICNub3R5X2xheW91dF9fY2VudGVyUmlnaHQsICNub3R5X2xheW91dF9fY2VudGVyTGVmdCwgI25vdHlfbGF5b3V0X19jZW50ZXIsICNub3R5X2xheW91dF9fYm90dG9tUmlnaHQsICNub3R5X2xheW91dF9fYm90dG9tQ2VudGVyLCAjbm90eV9sYXlvdXRfX2JvdHRvbUxlZnQsICNub3R5X2xheW91dF9fYm90dG9tLCAjbm90eV9sYXlvdXRfX3RvcFJpZ2h0LCAjbm90eV9sYXlvdXRfX3RvcENlbnRlciwgI25vdHlfbGF5b3V0X190b3BMZWZ0LCAjbm90eV9sYXlvdXRfX3RvcCB7XFxuICBwb3NpdGlvbjogZml4ZWQ7XFxuICBtYXJnaW46IDA7XFxuICBwYWRkaW5nOiAwO1xcbiAgei1pbmRleDogOTk5OTk5OTtcXG4gIHRyYW5zZm9ybTogdHJhbnNsYXRlWigwKSBzY2FsZSgxLCAxKTtcXG4gIGJhY2tmYWNlLXZpc2liaWxpdHk6IGhpZGRlbjtcXG4gIC13ZWJraXQtZm9udC1zbW9vdGhpbmc6IHN1YnBpeGVsLWFudGlhbGlhc2VkO1xcbiAgZmlsdGVyOiBibHVyKDApO1xcbiAgLXdlYmtpdC1maWx0ZXI6IGJsdXIoMCk7XFxuICBtYXgtd2lkdGg6IDkwJTtcXG59XFxuXFxuI25vdHlfbGF5b3V0X190b3Age1xcbiAgdG9wOiAwO1xcbiAgbGVmdDogNSU7XFxuICB3aWR0aDogOTAlO1xcbn1cXG5cXG4jbm90eV9sYXlvdXRfX3RvcExlZnQge1xcbiAgdG9wOiAyMHB4O1xcbiAgbGVmdDogMjBweDtcXG4gIHdpZHRoOiAzMjVweDtcXG59XFxuXFxuI25vdHlfbGF5b3V0X190b3BDZW50ZXIge1xcbiAgdG9wOiA1JTtcXG4gIGxlZnQ6IDUwJTtcXG4gIHdpZHRoOiAzMjVweDtcXG4gIHRyYW5zZm9ybTogdHJhbnNsYXRlKGNhbGMoLTUwJSAtIC41cHgpKSB0cmFuc2xhdGVaKDApIHNjYWxlKDEsIDEpO1xcbn1cXG5cXG4jbm90eV9sYXlvdXRfX3RvcFJpZ2h0IHtcXG4gIHRvcDogMjBweDtcXG4gIHJpZ2h0OiAyMHB4O1xcbiAgd2lkdGg6IDMyNXB4O1xcbn1cXG5cXG4jbm90eV9sYXlvdXRfX2JvdHRvbSB7XFxuICBib3R0b206IDA7XFxuICBsZWZ0OiA1JTtcXG4gIHdpZHRoOiA5MCU7XFxufVxcblxcbiNub3R5X2xheW91dF9fYm90dG9tTGVmdCB7XFxuICBib3R0b206IDIwcHg7XFxuICBsZWZ0OiAyMHB4O1xcbiAgd2lkdGg6IDMyNXB4O1xcbn1cXG5cXG4jbm90eV9sYXlvdXRfX2JvdHRvbUNlbnRlciB7XFxuICBib3R0b206IDUlO1xcbiAgbGVmdDogNTAlO1xcbiAgd2lkdGg6IDMyNXB4O1xcbiAgdHJhbnNmb3JtOiB0cmFuc2xhdGUoY2FsYygtNTAlIC0gLjVweCkpIHRyYW5zbGF0ZVooMCkgc2NhbGUoMSwgMSk7XFxufVxcblxcbiNub3R5X2xheW91dF9fYm90dG9tUmlnaHQge1xcbiAgYm90dG9tOiAyMHB4O1xcbiAgcmlnaHQ6IDIwcHg7XFxuICB3aWR0aDogMzI1cHg7XFxufVxcblxcbiNub3R5X2xheW91dF9fY2VudGVyIHtcXG4gIHRvcDogNTAlO1xcbiAgbGVmdDogNTAlO1xcbiAgd2lkdGg6IDMyNXB4O1xcbiAgdHJhbnNmb3JtOiB0cmFuc2xhdGUoY2FsYygtNTAlIC0gLjVweCksIGNhbGMoLTUwJSAtIC41cHgpKSB0cmFuc2xhdGVaKDApIHNjYWxlKDEsIDEpO1xcbn1cXG5cXG4jbm90eV9sYXlvdXRfX2NlbnRlckxlZnQge1xcbiAgdG9wOiA1MCU7XFxuICBsZWZ0OiAyMHB4O1xcbiAgd2lkdGg6IDMyNXB4O1xcbiAgdHJhbnNmb3JtOiB0cmFuc2xhdGUoMCwgY2FsYygtNTAlIC0gLjVweCkpIHRyYW5zbGF0ZVooMCkgc2NhbGUoMSwgMSk7XFxufVxcblxcbiNub3R5X2xheW91dF9fY2VudGVyUmlnaHQge1xcbiAgdG9wOiA1MCU7XFxuICByaWdodDogMjBweDtcXG4gIHdpZHRoOiAzMjVweDtcXG4gIHRyYW5zZm9ybTogdHJhbnNsYXRlKDAsIGNhbGMoLTUwJSAtIC41cHgpKSB0cmFuc2xhdGVaKDApIHNjYWxlKDEsIDEpO1xcbn1cXG5cXG4ubm90eV9wcm9ncmVzc2JhciB7XFxuICBkaXNwbGF5OiBub25lO1xcbn1cXG5cXG4ubm90eV9oYXNfdGltZW91dC5ub3R5X2hhc19wcm9ncmVzc2JhciAubm90eV9wcm9ncmVzc2JhciB7XFxuICBkaXNwbGF5OiBibG9jaztcXG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG4gIGxlZnQ6IDA7XFxuICBib3R0b206IDA7XFxuICBoZWlnaHQ6IDNweDtcXG4gIHdpZHRoOiAxMDAlO1xcbiAgYmFja2dyb3VuZC1jb2xvcjogIzY0NjQ2NDtcXG4gIG9wYWNpdHk6IDAuMjtcXG4gIGZpbHRlcjogYWxwaGEob3BhY2l0eT0xMCk7XFxufVxcblxcbi5ub3R5X2JhciB7XFxuICAtd2Via2l0LWJhY2tmYWNlLXZpc2liaWxpdHk6IGhpZGRlbjtcXG4gIC13ZWJraXQtdHJhbnNmb3JtOiB0cmFuc2xhdGUoMCwgMCkgdHJhbnNsYXRlWigwKSBzY2FsZSgxLCAxKTtcXG4gIHRyYW5zZm9ybTogdHJhbnNsYXRlKDAsIDApIHNjYWxlKDEsIDEpO1xcbiAgLXdlYmtpdC1mb250LXNtb290aGluZzogc3VicGl4ZWwtYW50aWFsaWFzZWQ7XFxuICBvdmVyZmxvdzogaGlkZGVuO1xcbn1cXG5cXG4ubm90eV9lZmZlY3RzX29wZW4ge1xcbiAgb3BhY2l0eTogMDtcXG4gIHRyYW5zZm9ybTogdHJhbnNsYXRlKDUwJSk7XFxuICBhbmltYXRpb246IG5vdHlfYW5pbV9pbiAwLjVzIGN1YmljLWJlemllcigwLjY4LCAtMC41NSwgMC4yNjUsIDEuNTUpO1xcbiAgYW5pbWF0aW9uLWZpbGwtbW9kZTogZm9yd2FyZHM7XFxufVxcblxcbi5ub3R5X2VmZmVjdHNfY2xvc2Uge1xcbiAgYW5pbWF0aW9uOiBub3R5X2FuaW1fb3V0IDAuNXMgY3ViaWMtYmV6aWVyKDAuNjgsIC0wLjU1LCAwLjI2NSwgMS41NSk7XFxuICBhbmltYXRpb24tZmlsbC1tb2RlOiBmb3J3YXJkcztcXG59XFxuXFxuLm5vdHlfZml4X2VmZmVjdHNfaGVpZ2h0IHtcXG4gIGFuaW1hdGlvbjogbm90eV9hbmltX2hlaWdodCA3NW1zIGVhc2Utb3V0O1xcbn1cXG5cXG4ubm90eV9jbG9zZV93aXRoX2NsaWNrIHtcXG4gIGN1cnNvcjogcG9pbnRlcjtcXG59XFxuXFxuLm5vdHlfY2xvc2VfYnV0dG9uIHtcXG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG4gIHRvcDogMnB4O1xcbiAgcmlnaHQ6IDJweDtcXG4gIGZvbnQtd2VpZ2h0OiBib2xkO1xcbiAgd2lkdGg6IDIwcHg7XFxuICBoZWlnaHQ6IDIwcHg7XFxuICB0ZXh0LWFsaWduOiBjZW50ZXI7XFxuICBsaW5lLWhlaWdodDogMjBweDtcXG4gIGJhY2tncm91bmQtY29sb3I6IHJnYmEoMCwgMCwgMCwgMC4wNSk7XFxuICBib3JkZXItcmFkaXVzOiAycHg7XFxuICBjdXJzb3I6IHBvaW50ZXI7XFxuICB0cmFuc2l0aW9uOiBhbGwgMC4ycyBlYXNlLW91dDtcXG59XFxuXFxuLm5vdHlfY2xvc2VfYnV0dG9uOmhvdmVyIHtcXG4gIGJhY2tncm91bmQtY29sb3I6IHJnYmEoMCwgMCwgMCwgMC4xKTtcXG59XFxuXFxuLm5vdHlfbW9kYWwge1xcbiAgcG9zaXRpb246IGZpeGVkO1xcbiAgd2lkdGg6IDEwMCU7XFxuICBoZWlnaHQ6IDEwMCU7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiAjMDAwO1xcbiAgei1pbmRleDogMTAwMDA7XFxuICBvcGFjaXR5OiAwLjM7XFxuICBsZWZ0OiAwO1xcbiAgdG9wOiAwO1xcbn1cXG5cXG4ubm90eV9tb2RhbC5ub3R5X21vZGFsX29wZW4ge1xcbiAgb3BhY2l0eTogMDtcXG4gIGFuaW1hdGlvbjogbm90eV9tb2RhbF9pbiAwLjNzIGVhc2Utb3V0O1xcbn1cXG5cXG4ubm90eV9tb2RhbC5ub3R5X21vZGFsX2Nsb3NlIHtcXG4gIGFuaW1hdGlvbjogbm90eV9tb2RhbF9vdXQgMC4zcyBlYXNlLW91dDtcXG4gIGFuaW1hdGlvbi1maWxsLW1vZGU6IGZvcndhcmRzO1xcbn1cXG5cXG5Aa2V5ZnJhbWVzIG5vdHlfbW9kYWxfaW4ge1xcbiAgMTAwJSB7XFxuICAgIG9wYWNpdHk6IDAuMztcXG4gIH1cXG59XFxuQGtleWZyYW1lcyBub3R5X21vZGFsX291dCB7XFxuICAxMDAlIHtcXG4gICAgb3BhY2l0eTogMDtcXG4gIH1cXG59XFxuQGtleWZyYW1lcyBub3R5X21vZGFsX291dCB7XFxuICAxMDAlIHtcXG4gICAgb3BhY2l0eTogMDtcXG4gIH1cXG59XFxuQGtleWZyYW1lcyBub3R5X2FuaW1faW4ge1xcbiAgMTAwJSB7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlKDApO1xcbiAgICBvcGFjaXR5OiAxO1xcbiAgfVxcbn1cXG5Aa2V5ZnJhbWVzIG5vdHlfYW5pbV9vdXQge1xcbiAgMTAwJSB7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlKDUwJSk7XFxuICAgIG9wYWNpdHk6IDA7XFxuICB9XFxufVxcbkBrZXlmcmFtZXMgbm90eV9hbmltX2hlaWdodCB7XFxuICAxMDAlIHtcXG4gICAgaGVpZ2h0OiAwO1xcbiAgfVxcbn1cXG4ubm90eV90aGVtZV9fbWludC5ub3R5X2JhciB7XFxuICBtYXJnaW46IDRweCAwO1xcbiAgb3ZlcmZsb3c6IGhpZGRlbjtcXG4gIGJvcmRlci1yYWRpdXM6IDJweDtcXG4gIHBvc2l0aW9uOiByZWxhdGl2ZTtcXG59XFxuLm5vdHlfdGhlbWVfX21pbnQubm90eV9iYXIgLm5vdHlfYm9keSB7XFxuICBwYWRkaW5nOiAxMHB4O1xcbiAgZm9udC1zaXplOiAxNHB4O1xcbn1cXG4ubm90eV90aGVtZV9fbWludC5ub3R5X2JhciAubm90eV9idXR0b25zIHtcXG4gIHBhZGRpbmc6IDEwcHg7XFxufVxcblxcbi5ub3R5X3RoZW1lX19taW50Lm5vdHlfdHlwZV9fYWxlcnQsXFxuLm5vdHlfdGhlbWVfX21pbnQubm90eV90eXBlX19ub3RpZmljYXRpb24ge1xcbiAgYmFja2dyb3VuZC1jb2xvcjogI2ZmZjtcXG4gIGJvcmRlci1ib3R0b206IDFweCBzb2xpZCAjRDFEMUQxO1xcbiAgY29sb3I6ICMyRjJGMkY7XFxufVxcblxcbi5ub3R5X3RoZW1lX19taW50Lm5vdHlfdHlwZV9fd2FybmluZyB7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiAjRkZBRTQyO1xcbiAgYm9yZGVyLWJvdHRvbTogMXB4IHNvbGlkICNFODlGM0M7XFxuICBjb2xvcjogI2ZmZjtcXG59XFxuXFxuLm5vdHlfdGhlbWVfX21pbnQubm90eV90eXBlX19lcnJvciB7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiAjREU2MzZGO1xcbiAgYm9yZGVyLWJvdHRvbTogMXB4IHNvbGlkICNDQTVBNjU7XFxuICBjb2xvcjogI2ZmZjtcXG59XFxuXFxuLm5vdHlfdGhlbWVfX21pbnQubm90eV90eXBlX19pbmZvLFxcbi5ub3R5X3RoZW1lX19taW50Lm5vdHlfdHlwZV9faW5mb3JtYXRpb24ge1xcbiAgYmFja2dyb3VuZC1jb2xvcjogIzdGN0VGRjtcXG4gIGJvcmRlci1ib3R0b206IDFweCBzb2xpZCAjNzQ3M0U4O1xcbiAgY29sb3I6ICNmZmY7XFxufVxcblxcbi5ub3R5X3RoZW1lX19taW50Lm5vdHlfdHlwZV9fc3VjY2VzcyB7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiAjQUZDNzY1O1xcbiAgYm9yZGVyLWJvdHRvbTogMXB4IHNvbGlkICNBMEI1NUM7XFxuICBjb2xvcjogI2ZmZjtcXG59XFxuXFxuKiB7XFxuICBtYXJnaW46IDA7XFxufVxcblxcbmh0bWwsXFxuYm9keSB7XFxuICBoZWlnaHQ6IDEwMCU7XFxuICB3aWR0aDogMTAwJTtcXG59XFxuXFxuYnV0dG9uOmZvY3VzIHtcXG4gIG91dGxpbmU6IG5vbmU7XFxufVxcblxcbmJvZHkge1xcbiAgZm9udC1mYW1pbHk6IFxcXCJMYXRvXFxcIiwgXFxcInNhbnMtc2VyaWZcXFwiO1xcbiAgLXdlYmtpdC1mb250LXNtb290aGluZzogYW50aWFsaWFzZWQ7XFxuICBjb2xvcjogIzIzMjMyMztcXG4gIHdpZHRoOiAxMDAlO1xcbn1cXG5cXG5uYXYge1xcbiAgcG9zaXRpb246IHJlbGF0aXZlO1xcbiAgbWluLWhlaWdodDogMTIwcHg7XFxufVxcblxcbi5uYXYtd3JhcHBlciB7XFxuICBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7XFxuICBwYWRkaW5nOiAxMHB4O1xcbiAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgdG9wOiAyMCU7XFxuICByaWdodDogMSU7XFxufVxcblxcbi5uYXYtd3JhcHBlciB1bCBsaSB7XFxuICBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7XFxuICBtYXJnaW46IDAgMTBweDtcXG4gIHBhZGRpbmc6IDVweDtcXG4gIGZvbnQtc2l6ZTogMThweDtcXG59XFxuXFxuLm5hdi13cmFwcGVyIHVsIGxpOmxhc3QtY2hpbGQge1xcbiAgcG9zaXRpb246IHJlbGF0aXZlO1xcbn1cXG5cXG4udG90YWwtY291bnRlciB7XFxuICBwb3NpdGlvbjogYWJzb2x1dGU7XFxuICBiYWNrZ3JvdW5kOiAjNjRhMGZmO1xcbiAgY29sb3I6IHdoaXRlO1xcbiAgd2lkdGg6IDIwcHg7XFxuICBoZWlnaHQ6IDIwcHg7XFxuICBib3JkZXItcmFkaXVzOiA1MCU7XFxuICBwYWRkaW5nOiAycHggMHB4IDAgNnB4O1xcbiAgZm9udC1zaXplOiAxM3B4O1xcbiAgZm9udC13ZWlnaHQ6IGJvbGQ7XFxuICB0b3A6IC0xMCU7XFxuICByaWdodDogLTIwJTtcXG59XFxuXFxuLm5hdi13cmFwcGVyIHVsIGxpIGEge1xcbiAgY29sb3I6ICNGRTVGMUU7XFxuICB0ZXh0LWRlY29yYXRpb246IG5vbmU7XFxufVxcblxcbi5jYXJ0IHtcXG4gIHdpZHRoOiA0NHB4O1xcbiAgaGVpZ2h0OiAzMHB4O1xcbn1cXG5cXG4ubG9nby13cmFwcGVyIHtcXG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG4gIHRvcDogNSU7XFxuICBsZWZ0OiAwJTtcXG4gIGRpc3BsYXk6IGlubGluZS1ibG9jaztcXG59XFxuXFxuLmxvZ28td3JhcHBlciBpbWcge1xcbiAgd2lkdGg6IDE1MHB4O1xcbiAgaGVpZ2h0OiAxMjBweDtcXG59XFxuXFxuLmxvZ28td3JhcHBlciBzcGFuIHtcXG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG4gIHRvcDogNDAlO1xcbiAgbGVmdDogMTAwJTtcXG4gIGxldHRlci1zcGFjaW5nOiA2cHg7XFxuICBjb2xvcjogI0ZFNUYxRTtcXG4gIGZvbnQtc2l6ZTogMjNweDtcXG4gIGZvbnQtd2VpZ2h0OiA2MDA7XFxufVxcblxcbi5pbnRyby1jb250YWluZXIge1xcbiAgcG9zaXRpb246IHJlbGF0aXZlO1xcbiAgaGVpZ2h0OiA4MCU7XFxuICB3aWR0aDogMTAwJTtcXG4gIGJhY2tncm91bmQ6ICNmOGY4Zjg7XFxuICBsZWZ0OiAwO1xcbn1cXG5cXG4uYmFubmVyIHtcXG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG4gIHJpZ2h0OiAwJTtcXG4gIHRvcDogMTQlO1xcbiAgd2lkdGg6IDM0JTtcXG4gIGhlaWdodDogNzklO1xcbn1cXG5cXG4uY2FwdGlvbiB7XFxuICBmb250LXNpemU6IDIwcHg7XFxuICBsZXR0ZXItc3BhY2luZzogMnB4O1xcbiAgcGFkZGluZzogMTBweDtcXG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG4gIHRvcDogNDAlO1xcbiAgbGVmdDogNSU7XFxufVxcblxcbi5jYXB0aW9uIGgxIHtcXG4gIGNvbG9yOiAjMjMyMzIzO1xcbiAgZm9udC1zaXplOiA1MHB4O1xcbiAgbGV0dGVyLXNwYWNpbmc6IDZweDtcXG4gIG1hcmdpbjogMjBweCAwO1xcbn1cXG5cXG4ub3JkZXIge1xcbiAgYmFja2dyb3VuZDogI0ZFNUYxRTtcXG4gIGNvbG9yOiAjZmZmO1xcbiAgcGFkZGluZzogN3B4O1xcbiAgYm9yZGVyOiAxcHggd2hpdGUgc29saWQ7XFxuICBib3JkZXItcmFkaXVzOiA2cHg7XFxuICB0ZXh0LWRlY29yYXRpb246IG5vbmU7XFxuICB3aWR0aDogNjAlO1xcbiAgZGlzcGxheTogYmxvY2s7XFxuICB0ZXh0LWFsaWduOiBjZW50ZXI7XFxufVxcblxcbi5vcmRlcjpob3ZlciB7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiAjMjMyMzIzO1xcbiAgY29sb3I6ICNmZmY7XFxufVxcblxcbi5uYXYtd3JhcHBlciB1bCBsaSBhOmhvdmVyIHtcXG4gIGNvbG9yOiAjMjMyMzIzO1xcbn1cXG5cXG4ubWVudS1jb250YWluZXIge1xcbiAgaGVpZ2h0OiAxMDAlO1xcbiAgcG9zaXRpb246IHJlbGF0aXZlO1xcbiAgd2lkdGg6IDEwMCU7XFxufVxcblxcbi5tZW51LWNvbnRhaW5lciBoMiB7XFxuICBmb250LXNpemU6IDMwcHg7XFxuICBtYXJnaW46IDMwcHg7XFxuICBmb250LXdlaWdodDogYm9sZDtcXG4gIGNvbG9yOiAjRkU1RjFFO1xcbiAgbGV0dGVyLXNwYWNpbmc6IDVweDtcXG59XFxuXFxuLm1lbnUtaXRlbSBpbWcge1xcbiAgd2lkdGg6IDUwJTtcXG4gIGhlaWdodDogNTAlO1xcbiAgZGlzcGxheTogYmxvY2s7XFxuICBtYXJnaW46IGF1dG87XFxufVxcblxcbi5tZW51LWl0ZW0gLml0ZW0tbmFtZSB7XFxuICBkaXNwbGF5OiBibG9jaztcXG4gIHRleHQtYWxpZ246IGNlbnRlcjtcXG4gIGZvbnQtd2VpZ2h0OiA3MDA7XFxuICBsZXR0ZXItc3BhY2luZzogMnB4O1xcbiAgZm9udC1zaXplOiAxOHB4O1xcbiAgY29sb3I6ICMyMzIzMjM7XFxuICBtYXJnaW46IDVweCAwO1xcbn1cXG5cXG4ubWVudS1pdGVtIC5pdGVtLXByaWNlIHtcXG4gIGRpc3BsYXk6IGlubGluZS1ibG9jaztcXG4gIHdpZHRoOiA0MCU7XFxuICB0ZXh0LWFsaWduOiBsZWZ0O1xcbiAgcGFkZGluZzogNXB4O1xcbiAgcGFkZGluZy1sZWZ0OiAyMHB4O1xcbiAgZm9udC13ZWlnaHQ6IDUwMDtcXG4gIGNvbG9yOiAjMjMyMzIzO1xcbn1cXG5cXG4ubWVudS1pdGVtIGJ1dHRvbiB7XFxuICBiYWNrZ3JvdW5kOiAjRkU1RjFFO1xcbiAgY29sb3I6ICNmZmY7XFxuICB3b3JkLXNwYWNpbmc6IDEwcHg7XFxuICBwYWRkaW5nOiA1cHg7XFxuICBib3JkZXI6IDFweCB3aGl0ZSBzb2xpZDtcXG4gIGJvcmRlci1yYWRpdXM6IDVweDtcXG4gIG1hcmdpbi1sZWZ0OiAzMHB4O1xcbn1cXG5cXG4ubWVudS1pdGVtIGJ1dHRvbjpmb2N1cyB7XFxuICBvdXRsaW5lOiBub25lO1xcbn1cXG5cXG4uY2FydC1lbXB0eSBoMSwgLmNhcnQtbm9uZW1wdHkgaDEge1xcbiAgY29sb3I6ICMyMzIzMjM7XFxuICB0ZXh0LWFsaWduOiBjZW50ZXI7XFxuICBmb250LXdlaWdodDogNzAwO1xcbiAgZm9udC1zaXplOiAzMHB4O1xcbiAgbWFyZ2luOiAyMHB4IDA7XFxuICBsZXR0ZXItc3BhY2luZzogM3B4O1xcbn1cXG5cXG4uY2FydC1lbXB0eSBwIHtcXG4gIGZvbnQtc2l6ZTogMjBweDtcXG4gIG1hcmdpbjogYXV0bztcXG4gIHRleHQtYWxpZ246IGNlbnRlcjtcXG4gIHBhZGRpbmc6IDVweDtcXG59XFxuXFxuLmltZy13cmFwcGVyIHtcXG4gIHdpZHRoOiA0MCU7XFxuICBtYXJnaW46IGF1dG87XFxufVxcblxcbi5pbWctd3JhcHBlciBpbWcge1xcbiAgd2lkdGg6IDEwMCU7XFxuICBoZWlnaHQ6IDEwMCU7XFxufVxcblxcbi5jYXJ0LWVtcHR5IGEge1xcbiAgYmFja2dyb3VuZDogI0ZFNUYxRTtcXG4gIGNvbG9yOiAjZmZmO1xcbiAgcGFkZGluZzogN3B4O1xcbiAgYm9yZGVyOiAxcHggd2hpdGUgc29saWQ7XFxuICBib3JkZXItcmFkaXVzOiA2cHg7XFxuICB0ZXh0LWRlY29yYXRpb246IG5vbmU7XFxuICB3aWR0aDogMTAwcHg7XFxuICBtYXJnaW46IDEwcHggYXV0bztcXG4gIGRpc3BsYXk6IGJsb2NrO1xcbiAgdGV4dC1hbGlnbjogY2VudGVyO1xcbn1cXG5cXG4uY2FydC1lbXB0eSBhOmhvdmVyIHtcXG4gIGJhY2tncm91bmQtY29sb3I6ICMyMzIzMjM7XFxuICBjb2xvcjogI2ZmZjtcXG59XFxuXFxuLmNhcnQtbm9uZW1wdHkge1xcbiAgYmFja2dyb3VuZDogI2Y4ZjhmODtcXG4gIG1pbi1oZWlnaHQ6IDEwMCU7XFxufVxcblxcbi5jb3VudGVyLWNvbnRhaW5lciB7XFxuICB3aWR0aDogNzAlO1xcbiAgbWFyZ2luOiBhdXRvO1xcbn1cXG5cXG4uY2FydC1ub25lbXB0eSBoMSB7XFxuICBmb250LXNpemU6IDIwcHg7XFxuICBwYWRkaW5nOiAyMHB4O1xcbiAgdGV4dC1hbGlnbjogbGVmdDtcXG4gIGxldHRlci1zcGFjaW5nOiAycHg7XFxufVxcblxcbi5jb3VudGVyIHtcXG4gIHBhZGRpbmctYm90dG9tOiAxNXB4O1xcbiAgYm9yZGVyLWJvdHRvbTogMXB4ICNjY2Mgc29saWQ7XFxufVxcblxcbi5waXp6YS1kaXNwbGF5IGltZyB7XFxuICB3aWR0aDogMzAlO1xcbiAgZGlzcGxheTogYmxvY2s7XFxuICBtYXJnaW46IGF1dG87XFxufVxcblxcbi5waXp6YS1uYW1lIHtcXG4gIGRpc3BsYXk6IGJsb2NrO1xcbiAgd2lkdGg6IDEwMCU7XFxuICB0ZXh0LWFsaWduOiBjZW50ZXI7XFxuICBmb250LXNpemU6IDE4cHg7XFxuICBjb2xvcjogI0ZFNUYxRTtcXG59XFxuXFxuLnBpenphLXNpemUge1xcbiAgZGlzcGxheTogYmxvY2s7XFxuICB3aWR0aDogMTAwJTtcXG4gIHRleHQtYWxpZ246IGNlbnRlcjtcXG4gIGZvbnQtc2l6ZTogMTZweDtcXG4gIGNvbG9yOiAjY2NjO1xcbn1cXG5cXG4ucGl6emEtcHJpY2UsIC5waXp6YS1udW1iZXIge1xcbiAgZGlzcGxheTogYmxvY2s7XFxuICB3aWR0aDogMTAwJTtcXG4gIGFsaWduLXNlbGY6IGNlbnRlcjtcXG4gIHRleHQtYWxpZ246IGNlbnRlcjtcXG4gIGZvbnQtc2l6ZTogMThweDtcXG4gIGNvbG9yOiAjMjMyMzIzO1xcbn1cXG5cXG4udG90YWwge1xcbiAgcGFkZGluZzogMjBweDtcXG4gIHRleHQtYWxpZ246IHJpZ2h0O1xcbn1cXG5cXG4udG90YWwgc3BhbiB7XFxuICBjb2xvcjogI0ZFNUYxRTtcXG4gIHBhZGRpbmc6IDAgNXB4O1xcbn1cXG5cXG4uYWRkcmVzcyB7XFxuICBtYXJnaW46IDEwcHggMDtcXG4gIHRleHQtYWxpZ246IHJpZ2h0O1xcbiAgcG9zaXRpb246IHJlbGF0aXZlO1xcbn1cXG5cXG4uYWRkcmVzcyBpbnB1dCB7XFxuICB3aWR0aDogNDAlO1xcbiAgaGVpZ2h0OiAyMHB4O1xcbiAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgcGFkZGluZzogMTBweDtcXG4gIHJpZ2h0OiAwO1xcbiAgYm9yZGVyOiAxcHggI2NjYyBzb2xpZDtcXG4gIGJvcmRlci1yYWRpdXM6IDFweDtcXG59XFxuXFxuLmFkZHJlc3MgYnV0dG9uIHtcXG4gIGJhY2tncm91bmQ6ICNGRTVGMUU7XFxuICBjb2xvcjogI2ZmZjtcXG4gIGJvcmRlci1yYWRpdXM6IDEwcHg7XFxuICBwYWRkaW5nOiA3cHg7XFxuICBmb250LXNpemU6IDE1cHg7XFxuICBib3JkZXI6IDFweCAjY2NjIHNvbGlkO1xcbiAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgdG9wOiA0MHB4O1xcbiAgcmlnaHQ6IDA7XFxufVxcblxcbi5sb2dpbi1jb250YWluZXIsIC5yZWdpc3Rlci1jb250YWluZXIge1xcbiAgYmFja2dyb3VuZDogI2Y4ZjhmODtcXG59XFxuXFxuLmxvZ2luLWNvbnRhaW5lciBpbnB1dCwgLnJlZ2lzdGVyLWNvbnRhaW5lciBpbnB1dCB7XFxuICBtYXJnaW46IDIwcHggYXV0bztcXG59XFxuXFxuLmxvZ2luLWJ1dHRvbiB7XFxuICBiYWNrZ3JvdW5kOiAjRkU1RjFFO1xcbiAgY29sb3I6ICNmZmY7XFxuICBmb250LXNpemU6IDE2cHg7XFxuICBwYWRkaW5nOiAxMHB4O1xcbiAgYm9yZGVyLXJhZGl1czogMTBweDtcXG4gIGJvcmRlcjogMXB4ICNjY2Mgc29saWQ7XFxufVxcblxcbi5sb2dpbi1idXR0b246aG92ZXIge1xcbiAgYmFja2dyb3VuZDogYmxhY2s7XFxufVxcblxcbi5mb3Jnb3QtcHcge1xcbiAgY29sb3I6ICNGRTVGMUU7XFxuICBmb250LXdlaWdodDogNzAwO1xcbn1cXG5cXG4uZm9yZ290LXB3OmhvdmVyIHtcXG4gIGNvbG9yOiAjMjMyMzIzO1xcbn1cXG5cXG4uYXV0aC1lcnJvciB7XFxuICBjb2xvcjogcmVkO1xcbiAgZm9udC1zaXplOiAxNHB4O1xcbiAgcGFkZGluZzogMTBweDtcXG4gIHRleHQtYWxpZ246IGNlbnRlcjtcXG59XFxuXFxuLmxvZ2dlZC1pbi1uYW1lIHtcXG4gIGZvbnQtc2l6ZTogMTZweDtcXG4gIGZvbnQtd2VpZ2h0OiA1MDE7XFxuICBwb3NpdGlvbjogYWJzb2x1dGU7XFxuICB0b3A6IDEwJTtcXG4gIHJpZ2h0OiA5JTtcXG4gIGNvbG9yOiBvcmFuZ2U7XFxufVxcblxcbi5ub3QtbG9nZ2VkLWluLW1zZyB7XFxuICBjb2xvcjogcmVkO1xcbiAgZm9udC13ZWlnaHQ6IDYwMDtcXG4gIGZvbnQtc2l6ZTogMTZweDtcXG4gIHBhZGRpbmc6IDEwcHg7XFxuICB0ZXh0LWFsaWduOiBjZW50ZXI7XFxufVxcblxcbi5ub3QtbG9nZ2VkLWluLW1zZyBhIHtcXG4gIGNvbG9yOiBibHVlO1xcbiAgdGV4dC1kZWNvcmF0aW9uOiB1bmRlcmxpbmU7XFxuICBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7XFxuICBwYWRkaW5nOiAwIDVweDtcXG59XFxuXFxuLm9yZGVyLXRoZWFkIHtcXG4gIHBhZGRpbmc6IDVweDtcXG4gIGJvcmRlcjogMXB4IHNvbGlkIGdyYXk7XFxufVxcblxcbi5vcmRlci10aGVhZCBkaXYge1xcbiAgYm9yZGVyLWxlZnQ6IDFweCBzb2xpZCBncmF5O1xcbiAgdGV4dC1hbGlnbjogY2VudGVyO1xcbn1cXG5cXG4ub3JkZXItcm93IHtcXG4gIHBhZGRpbmc6IDVweDtcXG4gIHRyYW5zaXRpb246IGFsbCAzcyBlYXNlO1xcbn1cXG5cXG4ub3JkZXItcm93IGRpdiB7XFxuICB0ZXh0LWFsaWduOiBjZW50ZXI7XFxuICBwYWRkaW5nOiAzcHg7XFxuICBib3JkZXItbGVmdDogMXB4IHNvbGlkIGdyYXk7XFxuICBib3JkZXItYm90dG9tOiAxcHggc29saWQgZ3JheTtcXG59XFxuXFxuQGtleWZyYW1lcyBzaGFrZSB7XFxuICAzMyUge1xcbiAgICB0cmFuc2Zvcm06IHJvdGF0ZSg1MGRlZyk7XFxuICB9XFxuICA2NiUge1xcbiAgICB0cmFuc2Zvcm06IHJvdGF0ZSgtNTBkZWcpO1xcbiAgfVxcbn1cXG4udHJhY2stY29udGFpbmVyIHtcXG4gIGJhY2tncm91bmQ6ICNmOGY4Zjg7XFxuICB3aWR0aDogMTAwJTtcXG4gIGhlaWdodDogNjAwcHg7XFxufVxcblxcbi50cmFja2luZy1zZWN0aW9uIHtcXG4gIHdpZHRoOiA3MCU7XFxuICBtYXJnaW46IDIwcHggYXV0bztcXG4gIHBhZGRpbmctdG9wOiAxMDBweDtcXG4gIGhlaWdodDogNTAwcHg7XFxufVxcblxcbi5vcmRlci1pbmZvIHtcXG4gIHBvc2l0aW9uOiByZWxhdGl2ZTtcXG59XFxuXFxuLm9yZGVyLWluZm8gaDEge1xcbiAgZm9udC13ZWlnaHQ6IDYwMDtcXG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG59XFxuXFxuLm9yZGVyLWluZm8gLm9yZGVyLWlkIHtcXG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG4gIHJpZ2h0OiAwO1xcbiAgY29sb3I6IG9yYW5nZTtcXG59XFxuXFxuLm9yZGVyLXN0YXR1cyB7XFxuICBtYXJnaW46IDUwcHg7XFxuICBwb3NpdGlvbjogcmVsYXRpdmU7XFxuICBsZWZ0OiAxOCU7XFxuICB0b3A6IDMlO1xcbn1cXG5cXG4ub3JkZXItc3RhdHVzIGxpIHtcXG4gIG1hcmdpbjogNTBweDtcXG4gIHdpZHRoOiAzMDBweDtcXG4gIGZvbnQtc2l6ZTogMTZweDtcXG4gIHBvc2l0aW9uOiByZWxhdGl2ZTtcXG4gIGxldHRlci1zcGFjaW5nOiAxLjVweDtcXG59XFxuXFxuLm9yZGVyLXN0YXR1cyBsaSAuaWNvbiB7XFxuICBmb250LXNpemU6IDMwcHg7XFxuICBwb3NpdGlvbjogYWJzb2x1dGU7XFxuICByaWdodDogMDtcXG4gIHRvcDogLTVweDtcXG4gIHRyYW5zaXRpb246IHRyYW5zZm9ybSAycyBlYXNlO1xcbiAgdHJhbnNmb3JtOiBzY2FsZSgxLjIpO1xcbn1cXG5cXG4ub3JkZXJzLXNtYWxsIHtcXG4gIGRpc3BsYXk6IG5vbmU7XFxufVxcblxcbi5vcmRlci1zdGF0dXMgbGk6YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFwiO1xcbiAgYmFja2dyb3VuZDogYmxhY2s7XFxuICBib3JkZXItcmFkaXVzOiA1MCU7XFxuICB3aWR0aDogMTBweDtcXG4gIGhlaWdodDogMTBweDtcXG4gIHJpZ2h0OiA4OHB4O1xcbiAgdG9wOiA3cHg7XFxuICBwb3NpdGlvbjogYWJzb2x1dGU7XFxufVxcblxcbi5vcmRlci1zdGF0dXMgbGk6YWZ0ZXIge1xcbiAgY29udGVudDogXFxcIlxcXCI7XFxuICBiYWNrZ3JvdW5kOiBibGFjaztcXG4gIHdpZHRoOiAycHg7XFxuICBoZWlnaHQ6IDE4OCU7XFxuICBtYXJnaW4tdG9wOiAxNXB4O1xcbiAgcmlnaHQ6IDkycHg7XFxuICB0b3A6IDEwcHg7XFxuICBwb3NpdGlvbjogYWJzb2x1dGU7XFxufVxcblxcbkBtZWRpYSBzY3JlZW4gYW5kIChtYXgtd2lkdGg6IDY1MHB4KSB7XFxuICAubWVudS1pdGVtIC5pdGVtLXByaWNlIHtcXG4gICAgdGV4dC1hbGlnbjogY2VudGVyO1xcbiAgfVxcblxcbiAgLmJhbm5lciB7XFxuICAgIHJpZ2h0OiAxJTtcXG4gICAgdG9wOiA0MSU7XFxuICAgIHdpZHRoOiA0MyU7XFxuICAgIGhlaWdodDogMTgwcHg7XFxuICB9XFxuXFxuICAub3JkZXItc3RhdHVzIHtcXG4gICAgbWFyZ2luOiAwO1xcbiAgICBsZWZ0OiAwO1xcbiAgICB3aWR0aDogMTAwJTtcXG4gICAgdG9wOiA1JTtcXG4gIH1cXG5cXG4gIC5vcmRlci1pbmZvIHtcXG4gICAgcGFkZGluZzogMTBweDtcXG4gIH1cXG5cXG4gIC5vcmRlci1pbmZvIGgxIHtcXG4gICAgcG9zaXRpb246IHN0YXRpYztcXG4gICAgZm9udC1zaXplOiAxNHB4O1xcbiAgfVxcblxcbiAgLm9yZGVyLWluZm8gLm9yZGVyLWlkIHtcXG4gICAgcG9zaXRpb246IHN0YXRpYztcXG4gICAgZm9udC1zaXplOiAxM3B4O1xcbiAgfVxcblxcbiAgLnRyYWNraW5nLXNlY3Rpb24ge1xcbiAgICBwYWRkaW5nLXRvcDogMzZweDtcXG4gIH1cXG5cXG4gIC5vcmRlci1zdGF0dXMgbGkge1xcbiAgICBmb250LXNpemU6IDEzcHg7XFxuICAgIG1hcmdpbjogMzBweDtcXG4gIH1cXG5cXG4gIC50cmFja2luZy1jb250YWluZXIge1xcbiAgICBoZWlnaHQ6IDQ1MHB4O1xcbiAgfVxcblxcbiAgLnRyYWNraW5nLXNlY3Rpb24ge1xcbiAgICB3aWR0aDogMTAwJTtcXG4gIH1cXG5cXG4gIC5vcmRlcnMtc21hbGwge1xcbiAgICBkaXNwbGF5OiBibG9jaztcXG4gIH1cXG5cXG4gIC5zdWNjZXNzLWFsZXJ0IHtcXG4gICAgZm9udC1zaXplOiAxNHB4O1xcbiAgfVxcblxcbiAgLm9yZGVycyB7XFxuICAgIGRpc3BsYXk6IG5vbmU7XFxuICB9XFxuXFxuICAuYXV0aC1lcnJvciB7XFxuICAgIGZvbnQtc2l6ZTogMTNweDtcXG4gIH1cXG5cXG4gIC5jYXB0aW9uIHtcXG4gICAgZm9udC1zaXplOiAxNHB4O1xcbiAgICB0b3A6IDE3JTtcXG4gICAgbGVmdDogNCU7XFxuICB9XFxuXFxuICAub3JkZXIge1xcbiAgICB3aWR0aDogNTAlO1xcbiAgfVxcblxcbiAgLmNhcHRpb24gaDEge1xcbiAgICBmb250LXNpemU6IDM1cHg7XFxuICB9XFxuXFxuICAuaW50cm8tY29udGFpbmVyIHtcXG4gICAgaGVpZ2h0OiA1MCU7XFxuICB9XFxuXFxuICAubWVudS1jb250YWluZXIgaDIge1xcbiAgICBmb250LXNpemU6IDIwcHg7XFxuICB9XFxuXFxuICAubWVudS1pdGVtIGltZyB7XFxuICAgIGhlaWdodDogOTBweDtcXG4gIH1cXG5cXG4gIC5tZW51LWl0ZW0gLml0ZW0tbmFtZSB7XFxuICAgIGZvbnQtc2l6ZTogMTRweDtcXG4gIH1cXG5cXG4gIC5sb2dvLXdyYXBwZXIgaW1nIHtcXG4gICAgbWFyZ2luOiA1cHg7XFxuICAgIGRpc3BsYXk6IGlubGluZTtcXG4gICAgaGVpZ2h0OiAxMDBweDtcXG4gIH1cXG5cXG4gIC5sb2dvLXdyYXBwZXIge1xcbiAgICBwb3NpdGlvbjogc3RhdGljO1xcbiAgICB0ZXh0LWFsaWduOiBjZW50ZXI7XFxuICAgIGRpc3BsYXk6IGJsb2NrO1xcbiAgfVxcblxcbiAgLmxvZ28td3JhcHBlciBzcGFuIHtcXG4gICAgcG9zaXRpb246IHN0YXRpYztcXG4gIH1cXG5cXG4gIC5uYXYtd3JhcHBlciB7XFxuICAgIGRpc3BsYXk6IGJsb2NrO1xcbiAgICB0ZXh0LWFsaWduOiBjZW50ZXI7XFxuICAgIHBvc2l0aW9uOiBzdGF0aWM7XFxuICB9XFxuXFxuICAuY2FydC1ub25lbXB0eSBoMSB7XFxuICAgIGZvbnQtc2l6ZTogMTZweDtcXG4gIH1cXG5cXG4gIC5ub3QtbG9nZ2VkLWluLW1zZyB7XFxuICAgIGZvbnQtc2l6ZTogMTRweDtcXG4gICAgcGFkZGluZzogMDtcXG4gIH1cXG5cXG4gIC5waXp6YS1uYW1lLCAucGl6emEtc2l6ZSwgLnBpenphLW51bWJlciwgLnBpenphLXByaWNlIHtcXG4gICAgZm9udC1zaXplOiAxNHB4O1xcbiAgfVxcblxcbiAgLmNhcnQtbm9uZW1wdHkge1xcbiAgICBtaW4taGVpZ2h0OiAwO1xcbiAgfVxcblxcbiAgLnNpZ24taW4tbXNnIHtcXG4gICAgZm9udC1zaXplOiAxNnB4O1xcbiAgfVxcblxcbiAgLmxvZ2luLWNvbnRhaW5lciBpbnB1dCwgLnJlZ2lzdGVyLWNvbnRhaW5lciBpbnB1dCB7XFxuICAgIHBhZGRpbmc6IDVweDtcXG4gICAgZm9udC1zaXplOiAxM3B4O1xcbiAgICBtYXJnaW46IDIwcHggYXV0bztcXG4gIH1cXG5cXG4gIC5sb2dpbi1idXR0b24ge1xcbiAgICBmb250LXNpemU6IDE0cHg7XFxuICB9XFxuXFxuICAuYWRkcmVzcyBpbnB1dCB7XFxuICAgIHdpZHRoOiA2MCU7XFxuICB9XFxuXFxuICAuYWRkcmVzcyBidXR0b24ge1xcbiAgICBmb250LXNpemU6IDEzcHg7XFxuICB9XFxuXFxuICAubG9nZ2VkLWluLW5hbWUge1xcbiAgICBmb250LXNpemU6IDEzcHg7XFxuICAgIHRvcDogNSU7XFxuICB9XFxuXFxuICAuY2FydC1lbXB0eSBwIHtcXG4gICAgZm9udC1zaXplOiAxNHB4O1xcbiAgfVxcblxcbiAgLmNhcnQtZW1wdHkgaDEge1xcbiAgICBmb250LXNpemU6IDIwcHg7XFxuICB9XFxuXFxuICAuY2FydC1lbXB0eSBhIHtcXG4gICAgZm9udC1zaXplOiAxM3B4O1xcbiAgfVxcblxcbiAgLmZvcmdvdC1wdyB7XFxuICAgIGZvbnQtc2l6ZTogMTVweDtcXG4gIH1cXG59XCIsIFwiXCIse1widmVyc2lvblwiOjMsXCJzb3VyY2VzXCI6W1wid2VicGFjazovLy4vbm9kZV9tb2R1bGVzL25vdHkvc3JjL25vdHkuc2Nzc1wiLFwid2VicGFjazovLy4vcmVzb3VyY2VzL3Njc3Mvc2Nzcy5zY3NzXCIsXCJ3ZWJwYWNrOi8vLi9ub2RlX21vZHVsZXMvbm90eS9zcmMvdGhlbWVzL21pbnQuc2Nzc1wiLFwid2VicGFjazovLy4vcmVzb3VyY2VzL3Njc3MvX3ZhcmlhYmxlcy5zY3NzXCJdLFwibmFtZXNcIjpbXSxcIm1hcHBpbmdzXCI6XCJBQUlBO0VBQ0UsZUFBQTtFQUNBLFNBQUE7RUFDQSxVQUFBO0VBQ0EsZ0JBQUE7RUFDQSxvQ0FBQTtFQUNBLDJCQUFBO0VBQ0EsNENBQUE7RUFDQSxlQUFBO0VBQ0EsdUJBQUE7RUFDQSxjQUFBO0FDSEY7O0FETUE7RUFFRSxNQUFBO0VBQ0EsUUFBQTtFQUNBLFVBQUE7QUNKRjs7QURPQTtFQUVFLFNBeEJrQjtFQXlCbEIsVUF6QmtCO0VBMEJsQixZQTNCbUI7QUNzQnJCOztBRFFBO0VBRUUsT0FBQTtFQUNBLFNBQUE7RUFDQSxZQWxDbUI7RUFtQ25CLGlFQUFBO0FDTkY7O0FEU0E7RUFFRSxTQXZDa0I7RUF3Q2xCLFdBeENrQjtFQXlDbEIsWUExQ21CO0FDbUNyQjs7QURVQTtFQUVFLFNBQUE7RUFDQSxRQUFBO0VBQ0EsVUFBQTtBQ1JGOztBRFdBO0VBRUUsWUFyRGtCO0VBc0RsQixVQXREa0I7RUF1RGxCLFlBeERtQjtBQytDckI7O0FEWUE7RUFFRSxVQUFBO0VBQ0EsU0FBQTtFQUNBLFlBL0RtQjtFQWdFbkIsaUVBQUE7QUNWRjs7QURhQTtFQUVFLFlBcEVrQjtFQXFFbEIsV0FyRWtCO0VBc0VsQixZQXZFbUI7QUM0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QWxRRjtJQUNFLGVBQUE7SUFDQSxPQUFBO0VBcVFBOztFQW5RRjtJQUNFLGVBQUE7RUFzUUE7O0VBcFFGO0lBQ0UsZUFBQTtFQXVRQTs7RUFyUUY7SUFDRSxlQUFBO0VBd1FBOztFQXRRRjtJQUNFLGVBQUE7RUF5UUE7QUFDRlwiLFwic291cmNlc0NvbnRlbnRcIjpbXCIkbm90eS1wcmltYXJ5LWNvbG9yOiAjMzMzO1xcbiRub3R5LWRlZmF1bHQtd2lkdGg6IDMyNXB4O1xcbiRub3R5LWNvcm5lci1zcGFjZTogMjBweDtcXG5cXG4ubm90eV9sYXlvdXRfbWl4aW4ge1xcbiAgcG9zaXRpb246IGZpeGVkO1xcbiAgbWFyZ2luOiAwO1xcbiAgcGFkZGluZzogMDtcXG4gIHotaW5kZXg6IDk5OTk5OTk7XFxuICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVooMCkgc2NhbGUoMS4wLCAxLjApO1xcbiAgYmFja2ZhY2UtdmlzaWJpbGl0eTogaGlkZGVuO1xcbiAgLXdlYmtpdC1mb250LXNtb290aGluZzogc3VicGl4ZWwtYW50aWFsaWFzZWQ7XFxuICBmaWx0ZXI6IGJsdXIoMCk7XFxuICAtd2Via2l0LWZpbHRlcjogYmx1cigwKTtcXG4gIG1heC13aWR0aDogOTAlO1xcbn1cXG5cXG4jbm90eV9sYXlvdXRfX3RvcCB7XFxuICBAZXh0ZW5kIC5ub3R5X2xheW91dF9taXhpbjtcXG4gIHRvcDogMDtcXG4gIGxlZnQ6IDUlO1xcbiAgd2lkdGg6IDkwJTtcXG59XFxuXFxuI25vdHlfbGF5b3V0X190b3BMZWZ0IHtcXG4gIEBleHRlbmQgLm5vdHlfbGF5b3V0X21peGluO1xcbiAgdG9wOiAkbm90eS1jb3JuZXItc3BhY2U7XFxuICBsZWZ0OiAkbm90eS1jb3JuZXItc3BhY2U7XFxuICB3aWR0aDogJG5vdHktZGVmYXVsdC13aWR0aDtcXG59XFxuXFxuI25vdHlfbGF5b3V0X190b3BDZW50ZXIge1xcbiAgQGV4dGVuZCAubm90eV9sYXlvdXRfbWl4aW47XFxuICB0b3A6IDUlO1xcbiAgbGVmdDogNTAlO1xcbiAgd2lkdGg6ICRub3R5LWRlZmF1bHQtd2lkdGg7XFxuICB0cmFuc2Zvcm06IHRyYW5zbGF0ZShjYWxjKC01MCUgLSAuNXB4KSkgdHJhbnNsYXRlWigwKSBzY2FsZSgxLjAsIDEuMCk7XFxufVxcblxcbiNub3R5X2xheW91dF9fdG9wUmlnaHQge1xcbiAgQGV4dGVuZCAubm90eV9sYXlvdXRfbWl4aW47XFxuICB0b3A6ICRub3R5LWNvcm5lci1zcGFjZTtcXG4gIHJpZ2h0OiAkbm90eS1jb3JuZXItc3BhY2U7XFxuICB3aWR0aDogJG5vdHktZGVmYXVsdC13aWR0aDtcXG59XFxuXFxuI25vdHlfbGF5b3V0X19ib3R0b20ge1xcbiAgQGV4dGVuZCAubm90eV9sYXlvdXRfbWl4aW47XFxuICBib3R0b206IDA7XFxuICBsZWZ0OiA1JTtcXG4gIHdpZHRoOiA5MCU7XFxufVxcblxcbiNub3R5X2xheW91dF9fYm90dG9tTGVmdCB7XFxuICBAZXh0ZW5kIC5ub3R5X2xheW91dF9taXhpbjtcXG4gIGJvdHRvbTogJG5vdHktY29ybmVyLXNwYWNlO1xcbiAgbGVmdDogJG5vdHktY29ybmVyLXNwYWNlO1xcbiAgd2lkdGg6ICRub3R5LWRlZmF1bHQtd2lkdGg7XFxufVxcblxcbiNub3R5X2xheW91dF9fYm90dG9tQ2VudGVyIHtcXG4gIEBleHRlbmQgLm5vdHlfbGF5b3V0X21peGluO1xcbiAgYm90dG9tOiA1JTtcXG4gIGxlZnQ6IDUwJTtcXG4gIHdpZHRoOiAkbm90eS1kZWZhdWx0LXdpZHRoO1xcbiAgdHJhbnNmb3JtOiB0cmFuc2xhdGUoY2FsYygtNTAlIC0gLjVweCkpIHRyYW5zbGF0ZVooMCkgc2NhbGUoMS4wLCAxLjApO1xcbn1cXG5cXG4jbm90eV9sYXlvdXRfX2JvdHRvbVJpZ2h0IHtcXG4gIEBleHRlbmQgLm5vdHlfbGF5b3V0X21peGluO1xcbiAgYm90dG9tOiAkbm90eS1jb3JuZXItc3BhY2U7XFxuICByaWdodDogJG5vdHktY29ybmVyLXNwYWNlO1xcbiAgd2lkdGg6ICRub3R5LWRlZmF1bHQtd2lkdGg7XFxufVxcblxcbiNub3R5X2xheW91dF9fY2VudGVyIHtcXG4gIEBleHRlbmQgLm5vdHlfbGF5b3V0X21peGluO1xcbiAgdG9wOiA1MCU7XFxuICBsZWZ0OiA1MCU7XFxuICB3aWR0aDogJG5vdHktZGVmYXVsdC13aWR0aDtcXG4gIHRyYW5zZm9ybTogdHJhbnNsYXRlKGNhbGMoLTUwJSAtIC41cHgpLCBjYWxjKC01MCUgLSAuNXB4KSkgdHJhbnNsYXRlWigwKSBzY2FsZSgxLjAsIDEuMCk7XFxufVxcblxcbiNub3R5X2xheW91dF9fY2VudGVyTGVmdCB7XFxuICBAZXh0ZW5kIC5ub3R5X2xheW91dF9taXhpbjtcXG4gIHRvcDogNTAlO1xcbiAgbGVmdDogJG5vdHktY29ybmVyLXNwYWNlO1xcbiAgd2lkdGg6ICRub3R5LWRlZmF1bHQtd2lkdGg7XFxuICB0cmFuc2Zvcm06IHRyYW5zbGF0ZSgwLCBjYWxjKC01MCUgLSAuNXB4KSkgdHJhbnNsYXRlWigwKSBzY2FsZSgxLjAsIDEuMCk7XFxufVxcblxcbiNub3R5X2xheW91dF9fY2VudGVyUmlnaHQge1xcbiAgQGV4dGVuZCAubm90eV9sYXlvdXRfbWl4aW47XFxuICB0b3A6IDUwJTtcXG4gIHJpZ2h0OiAkbm90eS1jb3JuZXItc3BhY2U7XFxuICB3aWR0aDogJG5vdHktZGVmYXVsdC13aWR0aDtcXG4gIHRyYW5zZm9ybTogdHJhbnNsYXRlKDAsIGNhbGMoLTUwJSAtIC41cHgpKSB0cmFuc2xhdGVaKDApIHNjYWxlKDEsIDEpO1xcbn1cXG5cXG4ubm90eV9wcm9ncmVzc2JhciB7XFxuICBkaXNwbGF5OiBub25lO1xcbn1cXG5cXG4ubm90eV9oYXNfdGltZW91dC5ub3R5X2hhc19wcm9ncmVzc2JhciAubm90eV9wcm9ncmVzc2JhciB7XFxuICBkaXNwbGF5OiBibG9jaztcXG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG4gIGxlZnQ6IDA7XFxuICBib3R0b206IDA7XFxuICBoZWlnaHQ6IDNweDtcXG4gIHdpZHRoOiAxMDAlO1xcbiAgYmFja2dyb3VuZC1jb2xvcjogIzY0NjQ2NDtcXG4gIG9wYWNpdHk6IDAuMjtcXG4gIGZpbHRlcjogYWxwaGEob3BhY2l0eT0xMClcXG59XFxuXFxuLm5vdHlfYmFyIHtcXG4gIC13ZWJraXQtYmFja2ZhY2UtdmlzaWJpbGl0eTogaGlkZGVuO1xcbiAgLXdlYmtpdC10cmFuc2Zvcm06IHRyYW5zbGF0ZSgwLCAwKSB0cmFuc2xhdGVaKDApIHNjYWxlKDEuMCwgMS4wKTtcXG4gIHRyYW5zZm9ybTogdHJhbnNsYXRlKDAsIDApIHNjYWxlKDEuMCwgMS4wKTtcXG4gIC13ZWJraXQtZm9udC1zbW9vdGhpbmc6IHN1YnBpeGVsLWFudGlhbGlhc2VkO1xcbiAgb3ZlcmZsb3c6IGhpZGRlbjtcXG59XFxuXFxuLm5vdHlfZWZmZWN0c19vcGVuIHtcXG4gIG9wYWNpdHk6IDA7XFxuICB0cmFuc2Zvcm06IHRyYW5zbGF0ZSg1MCUpO1xcbiAgYW5pbWF0aW9uOiBub3R5X2FuaW1faW4gLjVzIGN1YmljLWJlemllcigwLjY4LCAtMC41NSwgMC4yNjUsIDEuNTUpO1xcbiAgYW5pbWF0aW9uLWZpbGwtbW9kZTogZm9yd2FyZHM7XFxufVxcblxcbi5ub3R5X2VmZmVjdHNfY2xvc2Uge1xcbiAgYW5pbWF0aW9uOiBub3R5X2FuaW1fb3V0IC41cyBjdWJpYy1iZXppZXIoMC42OCwgLTAuNTUsIDAuMjY1LCAxLjU1KTtcXG4gIGFuaW1hdGlvbi1maWxsLW1vZGU6IGZvcndhcmRzO1xcbn1cXG5cXG4ubm90eV9maXhfZWZmZWN0c19oZWlnaHQge1xcbiAgYW5pbWF0aW9uOiBub3R5X2FuaW1faGVpZ2h0IDc1bXMgZWFzZS1vdXQ7XFxufVxcblxcbi5ub3R5X2Nsb3NlX3dpdGhfY2xpY2sge1xcbiAgY3Vyc29yOiBwb2ludGVyO1xcbn1cXG5cXG4ubm90eV9jbG9zZV9idXR0b24ge1xcbiAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgdG9wOiAycHg7XFxuICByaWdodDogMnB4O1xcbiAgZm9udC13ZWlnaHQ6IGJvbGQ7XFxuICB3aWR0aDogMjBweDtcXG4gIGhlaWdodDogMjBweDtcXG4gIHRleHQtYWxpZ246IGNlbnRlcjtcXG4gIGxpbmUtaGVpZ2h0OiAyMHB4O1xcbiAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSgwLCAwLCAwLCAuMDUpO1xcbiAgYm9yZGVyLXJhZGl1czogMnB4O1xcbiAgY3Vyc29yOiBwb2ludGVyO1xcbiAgdHJhbnNpdGlvbjogYWxsIC4ycyBlYXNlLW91dDtcXG59XFxuXFxuLm5vdHlfY2xvc2VfYnV0dG9uOmhvdmVyIHtcXG4gIGJhY2tncm91bmQtY29sb3I6IHJnYmEoMCwgMCwgMCwgLjEpO1xcbn1cXG5cXG4ubm90eV9tb2RhbCB7XFxuICBwb3NpdGlvbjogZml4ZWQ7XFxuICB3aWR0aDogMTAwJTtcXG4gIGhlaWdodDogMTAwJTtcXG4gIGJhY2tncm91bmQtY29sb3I6ICMwMDA7XFxuICB6LWluZGV4OiAxMDAwMDtcXG4gIG9wYWNpdHk6IC4zO1xcbiAgbGVmdDogMDtcXG4gIHRvcDogMDtcXG59XFxuXFxuLm5vdHlfbW9kYWwubm90eV9tb2RhbF9vcGVuIHtcXG4gIG9wYWNpdHk6IDA7XFxuICBhbmltYXRpb246IG5vdHlfbW9kYWxfaW4gLjNzIGVhc2Utb3V0O1xcbn1cXG4ubm90eV9tb2RhbC5ub3R5X21vZGFsX2Nsb3NlIHtcXG4gIGFuaW1hdGlvbjogbm90eV9tb2RhbF9vdXQgLjNzIGVhc2Utb3V0O1xcbiAgYW5pbWF0aW9uLWZpbGwtbW9kZTogZm9yd2FyZHM7XFxufVxcblxcbkBrZXlmcmFtZXMgbm90eV9tb2RhbF9pbiB7XFxuICAxMDAlIHtcXG4gICAgb3BhY2l0eTogLjM7XFxuICB9XFxufVxcbkBrZXlmcmFtZXMgbm90eV9tb2RhbF9vdXQge1xcbiAgMTAwJSB7XFxuICAgIG9wYWNpdHk6IDA7XFxuICB9XFxufVxcblxcbkBrZXlmcmFtZXMgbm90eV9tb2RhbF9vdXQge1xcbiAgMTAwJSB7XFxuICAgIG9wYWNpdHk6IDA7XFxuICB9XFxufVxcblxcbkBrZXlmcmFtZXMgbm90eV9hbmltX2luIHtcXG4gIDEwMCUge1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZSgwKTtcXG4gICAgb3BhY2l0eTogMTtcXG4gIH1cXG59XFxuXFxuQGtleWZyYW1lcyBub3R5X2FuaW1fb3V0IHtcXG4gIDEwMCUge1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZSg1MCUpO1xcbiAgICBvcGFjaXR5OiAwO1xcbiAgfVxcbn1cXG5cXG5Aa2V5ZnJhbWVzIG5vdHlfYW5pbV9oZWlnaHQge1xcbiAgMTAwJSB7XFxuICAgIGhlaWdodDogMDtcXG4gIH1cXG59XFxuXFxuLy9AaW1wb3J0IFxcXCJ0aGVtZXMvcmVsYXhcXFwiO1xcbi8vQGltcG9ydCBcXFwidGhlbWVzL21ldHJvdWlcXFwiO1xcbi8vQGltcG9ydCBcXFwidGhlbWVzL21pbnRcXFwiO1xcbi8vQGltcG9ydCBcXFwidGhlbWVzL3N1bnNldFxcXCI7XFxuLy9AaW1wb3J0IFxcXCJ0aGVtZXMvYm9vdHN0cmFwLXYzXFxcIjtcXG4vL0BpbXBvcnQgXFxcInRoZW1lcy9ib290c3RyYXAtdjRcXFwiO1xcbi8vQGltcG9ydCBcXFwidGhlbWVzL3NlbWFudGljdWlcXFwiO1xcbi8vQGltcG9ydCBcXFwidGhlbWVzL25lc3RcXFwiO1xcbi8vQGltcG9ydCBcXFwidGhlbWVzL2xpZ2h0XFxcIjtcXG5cIixcIkBpbXBvcnQgJy4vdmFyaWFibGVzJztcXHJcXG5AaW1wb3J0ICd+bm90eS9zcmMvbm90eS5zY3NzJztcXHJcXG5AaW1wb3J0ICd+bm90eS9zcmMvdGhlbWVzL21pbnQuc2Nzcyc7XFxyXFxuKiB7XFxyXFxuICBtYXJnaW46IDA7XFxyXFxufVxcclxcblxcclxcbmh0bWwsXFxyXFxuYm9keSB7XFxyXFxuICBoZWlnaHQ6IDEwMCU7XFxyXFxuICB3aWR0aDogMTAwJTtcXHJcXG59XFxyXFxuXFxyXFxuYnV0dG9uOmZvY3Vze1xcclxcbiAgb3V0bGluZTpub25lO1xcclxcbn1cXHJcXG5cXHJcXG5ib2R5IHtcXHJcXG4gIGZvbnQtZmFtaWx5OiBcXFwiTGF0b1xcXCIsIFxcXCJzYW5zLXNlcmlmXFxcIjtcXHJcXG4gIC13ZWJraXQtZm9udC1zbW9vdGhpbmc6IGFudGlhbGlhc2VkO1xcclxcbiAgY29sb3I6ICMyMzIzMjM7XFxyXFxuICB3aWR0aCA6IDEwMCU7XFxyXFxufVxcclxcblxcclxcbm5hdiB7XFxyXFxuICBwb3NpdGlvbjogcmVsYXRpdmU7XFxyXFxuICBtaW4taGVpZ2h0OiAxMjBweDtcXHJcXG59XFxyXFxuXFxyXFxuLm5hdi13cmFwcGVyIHtcXHJcXG4gIGRpc3BsYXk6IGlubGluZS1ibG9jaztcXHJcXG4gIHBhZGRpbmc6IDEwcHg7XFxyXFxuICBwb3NpdGlvbjogYWJzb2x1dGU7XFxyXFxuICB0b3A6IDIwJTtcXHJcXG4gIHJpZ2h0OiAxJTtcXHJcXG59XFxyXFxuXFxyXFxuLm5hdi13cmFwcGVyIHVsIGxpIHtcXHJcXG4gIGRpc3BsYXk6IGlubGluZS1ibG9jaztcXHJcXG4gIG1hcmdpbjogMCAxMHB4O1xcclxcbiAgcGFkZGluZzogNXB4O1xcclxcbiAgZm9udC1zaXplOiAxOHB4O1xcclxcbn1cXHJcXG5cXHJcXG4ubmF2LXdyYXBwZXIgdWwgbGk6bGFzdC1jaGlsZHtcXHJcXG5wb3NpdGlvbjpyZWxhdGl2ZTtcXHJcXG59XFxyXFxuXFxyXFxuLnRvdGFsLWNvdW50ZXIge1xcclxcbiAgICBwb3NpdGlvbjogYWJzb2x1dGU7XFxyXFxuICAgIGJhY2tncm91bmQ6IHJnYmEoMTAwLDE2MCwyNTUsMSk7XFxyXFxuICAgIGNvbG9yOiB3aGl0ZTtcXHJcXG4gICAgd2lkdGg6IDIwcHg7XFxyXFxuICAgIGhlaWdodDogMjBweDtcXHJcXG4gICAgYm9yZGVyLXJhZGl1czogNTAlO1xcclxcbiAgICBwYWRkaW5nOiAycHggMHB4IDAgNnB4O1xcclxcbiAgICBmb250LXNpemU6IDEzcHg7XFxyXFxuICAgIGZvbnQtd2VpZ2h0OiBib2xkO1xcclxcbiAgICB0b3A6IC0xMCU7XFxyXFxuICAgIHJpZ2h0OiAtMjAlO1xcclxcbn1cXHJcXG5cXHJcXG4ubmF2LXdyYXBwZXIgdWwgbGkgYSB7XFxyXFxuICBjb2xvcjogI0ZFNUYxRTtcXHJcXG4gIHRleHQtZGVjb3JhdGlvbjogbm9uZTtcXHJcXG59XFxyXFxuXFxyXFxuLmNhcnQge1xcclxcbiAgd2lkdGg6IDQ0cHg7XFxyXFxuICBoZWlnaHQ6IDMwcHg7XFxyXFxufVxcclxcblxcclxcbi5sb2dvLXdyYXBwZXIge1xcclxcbiAgcG9zaXRpb246IGFic29sdXRlO1xcclxcbiAgdG9wOiA1JTtcXHJcXG4gIGxlZnQ6IDAlO1xcclxcbiAgZGlzcGxheTogaW5saW5lLWJsb2NrO1xcclxcbn1cXHJcXG5cXHJcXG4ubG9nby13cmFwcGVyIGltZyB7XFxyXFxuICB3aWR0aDogMTUwcHg7XFxyXFxuICBoZWlnaHQ6IDEyMHB4O1xcclxcbn1cXHJcXG5cXHJcXG4ubG9nby13cmFwcGVyIHNwYW4ge1xcclxcbiAgcG9zaXRpb246IGFic29sdXRlO1xcclxcbiAgdG9wOiA0MCU7XFxyXFxuICBsZWZ0OiAxMDAlO1xcclxcbiAgbGV0dGVyLXNwYWNpbmc6IDZweDtcXHJcXG4gIGNvbG9yOiAjRkU1RjFFO1xcclxcbiAgZm9udC1zaXplOiAyM3B4O1xcclxcbiAgZm9udC13ZWlnaHQ6IDYwMDtcXHJcXG59XFxyXFxuXFxyXFxuLmludHJvLWNvbnRhaW5lciB7XFxyXFxuICBwb3NpdGlvbjogcmVsYXRpdmU7XFxyXFxuICBoZWlnaHQ6IDgwJTtcXHJcXG4gIHdpZHRoOiAxMDAlO1xcclxcbiAgYmFja2dyb3VuZDogI2Y4ZjhmODtcXHJcXG4gIGxlZnQ6IDA7XFxyXFxufVxcclxcblxcclxcbi5iYW5uZXIge1xcclxcbiAgcG9zaXRpb246IGFic29sdXRlO1xcclxcbiAgcmlnaHQ6IDAlO1xcclxcbiAgdG9wOiAxNCU7XFxyXFxuICB3aWR0aDogMzQlO1xcclxcbiAgaGVpZ2h0OiA3OSU7XFxyXFxufVxcclxcblxcclxcbi5jYXB0aW9uIHtcXHJcXG4gIGZvbnQtc2l6ZTogMjBweDtcXHJcXG4gIGxldHRlci1zcGFjaW5nOiAycHg7XFxyXFxuICBwYWRkaW5nOiAxMHB4O1xcclxcbiAgcG9zaXRpb246IGFic29sdXRlO1xcclxcbiAgdG9wOiA0MCU7XFxyXFxuICBsZWZ0OiA1JTtcXHJcXG59XFxyXFxuXFxyXFxuLmNhcHRpb24gaDEge1xcclxcbiAgY29sb3I6ICMyMzIzMjM7XFxyXFxuICBmb250LXNpemU6IDUwcHg7XFxyXFxuICBsZXR0ZXItc3BhY2luZzogNnB4O1xcclxcbiAgbWFyZ2luOiAyMHB4IDA7XFxyXFxufVxcclxcblxcclxcbi5vcmRlciB7XFxyXFxuICBiYWNrZ3JvdW5kOiAjRkU1RjFFO1xcclxcbiAgY29sb3I6ICNmZmY7XFxyXFxuICBwYWRkaW5nOiA3cHg7XFxyXFxuICBib3JkZXI6IDFweCB3aGl0ZSBzb2xpZDtcXHJcXG4gIGJvcmRlci1yYWRpdXM6IDZweDtcXHJcXG4gIHRleHQtZGVjb3JhdGlvbjogbm9uZTtcXHJcXG4gIHdpZHRoOiA2MCU7XFxyXFxuICBkaXNwbGF5OiBibG9jaztcXHJcXG4gIHRleHQtYWxpZ246IGNlbnRlcjtcXHJcXG59XFxyXFxuXFxyXFxuLm9yZGVyOmhvdmVyIHtcXHJcXG5iYWNrZ3JvdW5kLWNvbG9yOiRkYXJrO1xcclxcbmNvbG9yOiRwdXJlO1xcclxcblxcclxcbn1cXHJcXG5cXHJcXG4ubmF2LXdyYXBwZXIgdWwgbGkgYTpob3ZlciB7XFxyXFxuICBjb2xvcjogIzIzMjMyMztcXHJcXG59XFxyXFxuXFxyXFxuLm1lbnUtY29udGFpbmVyIHtcXHJcXG4gIGhlaWdodDogMTAwJTtcXHJcXG4gIHBvc2l0aW9uOiByZWxhdGl2ZTtcXHJcXG4gIHdpZHRoOiAxMDAlO1xcclxcbn1cXHJcXG5cXHJcXG4ubWVudS1jb250YWluZXIgaDIge1xcclxcbiAgZm9udC1zaXplOiAzMHB4O1xcclxcbiAgbWFyZ2luOiAzMHB4O1xcclxcbiAgZm9udC13ZWlnaHQ6Ym9sZDtcXHJcXG4gIGNvbG9yOiRwcmltYXJ5O1xcclxcbiAgbGV0dGVyLXNwYWNpbmc6IDVweDtcXHJcXG59XFxyXFxuXFxyXFxuLm1lbnUtaXRlbSBpbWcge1xcclxcbiAgd2lkdGg6IDUwJTtcXHJcXG4gIGhlaWdodDogNTAlO1xcclxcbiAgZGlzcGxheTogYmxvY2s7XFxyXFxuICBtYXJnaW46IGF1dG87XFxyXFxufVxcclxcblxcclxcbi5tZW51LWl0ZW0gLml0ZW0tbmFtZSB7XFxyXFxuICBkaXNwbGF5OiBibG9jaztcXHJcXG4gIHRleHQtYWxpZ246IGNlbnRlcjtcXHJcXG4gIGZvbnQtd2VpZ2h0OjcwMDtcXHJcXG4gIGxldHRlci1zcGFjaW5nOiAycHg7XFxyXFxuICBmb250LXNpemU6IDE4cHg7XFxyXFxuICBjb2xvcjogIzIzMjMyMztcXHJcXG4gIG1hcmdpbjogNXB4IDA7XFxyXFxufVxcclxcblxcclxcbi5tZW51LWl0ZW0gLml0ZW0tcHJpY2Uge1xcclxcbiAgZGlzcGxheTogaW5saW5lLWJsb2NrO1xcclxcbiAgd2lkdGg6IDQwJTtcXHJcXG4gIHRleHQtYWxpZ246IGxlZnQ7XFxyXFxuICBwYWRkaW5nOiA1cHg7XFxyXFxuICBwYWRkaW5nLWxlZnQ6IDIwcHg7XFxyXFxuICBmb250LXdlaWdodDogNTAwO1xcclxcbiAgY29sb3I6ICMyMzIzMjM7XFxyXFxufVxcclxcblxcclxcbi5tZW51LWl0ZW0gYnV0dG9uIHtcXHJcXG4gIGJhY2tncm91bmQ6ICNGRTVGMUU7XFxyXFxuICBjb2xvcjogI2ZmZjtcXHJcXG4gIHdvcmQtc3BhY2luZzogMTBweDtcXHJcXG4gIHBhZGRpbmc6IDVweDtcXHJcXG4gIGJvcmRlcjogMXB4IHdoaXRlIHNvbGlkO1xcclxcbiAgYm9yZGVyLXJhZGl1czogNXB4O1xcclxcbiAgbWFyZ2luLWxlZnQ6IDMwcHg7XFxyXFxufVxcclxcblxcclxcblxcclxcbi5tZW51LWl0ZW0gYnV0dG9uOmZvY3Vze1xcclxcbiAgb3V0bGluZSA6IG5vbmU7XFxyXFxufVxcclxcblxcclxcbi5jYXJ0LWVtcHR5IGgxLCAuY2FydC1ub25lbXB0eSBoMXtcXHJcXG4gIGNvbG9yOiRkYXJrO1xcclxcbiAgdGV4dC1hbGlnbjpjZW50ZXI7XFxyXFxuICBmb250LXdlaWdodDo3MDA7XFxyXFxuICBmb250LXNpemU6MzBweDtcXHJcXG4gIG1hcmdpbjoyMHB4IDA7XFxyXFxuICBsZXR0ZXItc3BhY2luZzogM3B4O1xcclxcbn1cXHJcXG5cXHJcXG4uY2FydC1lbXB0eSBwe1xcclxcbiAgZm9udC1zaXplOjIwcHg7XFxyXFxuICBtYXJnaW46YXV0bztcXHJcXG4gIHRleHQtYWxpZ246Y2VudGVyO1xcclxcbiAgcGFkZGluZzo1cHg7XFxyXFxufVxcclxcblxcclxcbi5pbWctd3JhcHBlcntcXHJcXG4gIHdpZHRoOjQwJTtcXHJcXG4gIG1hcmdpbjphdXRvO1xcclxcbn1cXHJcXG5cXHJcXG4uaW1nLXdyYXBwZXIgaW1ne1xcclxcbiAgd2lkdGg6MTAwJTtcXHJcXG4gIGhlaWdodDoxMDAlO1xcclxcbn1cXHJcXG5cXHJcXG4uY2FydC1lbXB0eSBhe1xcclxcbiAgYmFja2dyb3VuZDogI0ZFNUYxRTtcXHJcXG4gIGNvbG9yOiAjZmZmO1xcclxcbiAgcGFkZGluZzogN3B4O1xcclxcbiAgYm9yZGVyOiAxcHggd2hpdGUgc29saWQ7XFxyXFxuICBib3JkZXItcmFkaXVzOiA2cHg7XFxyXFxuICB0ZXh0LWRlY29yYXRpb246IG5vbmU7XFxyXFxuICB3aWR0aDogMTAwcHg7XFxyXFxuICBtYXJnaW46MTBweCBhdXRvO1xcclxcbiAgZGlzcGxheTogYmxvY2s7XFxyXFxuICB0ZXh0LWFsaWduOiBjZW50ZXI7XFxyXFxufVxcclxcblxcclxcbi5jYXJ0LWVtcHR5IGE6aG92ZXIge1xcclxcbmJhY2tncm91bmQtY29sb3I6JGRhcms7XFxyXFxuY29sb3I6JHB1cmU7XFxyXFxufVxcclxcblxcclxcbi5jYXJ0LW5vbmVtcHR5e1xcclxcbiAgYmFja2dyb3VuZDokc2Vjb25kYXJ5O1xcclxcbiAgbWluLWhlaWdodDoxMDAlO1xcclxcbn1cXHJcXG5cXHJcXG4uY291bnRlci1jb250YWluZXJ7XFxyXFxuICB3aWR0aDo3MCU7XFxyXFxuICBtYXJnaW46YXV0bztcXHJcXG59XFxyXFxuXFxyXFxuLmNhcnQtbm9uZW1wdHkgaDF7XFxyXFxuICBmb250LXNpemU6MjBweDtcXHJcXG4gIHBhZGRpbmc6MjBweDtcXHJcXG4gIHRleHQtYWxpZ246bGVmdDtcXHJcXG4gIGxldHRlci1zcGFjaW5nOjJweDtcXHJcXG59XFxyXFxuXFxyXFxuLmNvdW50ZXJ7XFxyXFxucGFkZGluZy1ib3R0b206MTVweDtcXHJcXG5ib3JkZXItYm90dG9tOjFweCAkZ3JheSBzb2xpZDtcXHJcXG59XFxyXFxuXFxyXFxuXFxyXFxuLnBpenphLWRpc3BsYXkgaW1ne1xcclxcbndpZHRoOjMwJTtcXHJcXG5kaXNwbGF5OmJsb2NrO1xcclxcbm1hcmdpbjphdXRvO1xcclxcbn1cXHJcXG5cXHJcXG4ucGl6emEtbmFtZXtcXHJcXG4gIGRpc3BsYXk6YmxvY2s7XFxyXFxuICB3aWR0aDoxMDAlO1xcclxcbiAgdGV4dC1hbGlnbjpjZW50ZXI7XFxyXFxuICBmb250LXNpemU6MThweDtcXHJcXG4gIGNvbG9yOiRwcmltYXJ5O1xcclxcbn1cXHJcXG5cXHJcXG4ucGl6emEtc2l6ZXtcXHJcXG4gIGRpc3BsYXk6YmxvY2s7XFxyXFxuICB3aWR0aDoxMDAlO1xcclxcbiAgdGV4dC1hbGlnbjpjZW50ZXI7XFxyXFxuICBmb250LXNpemU6MTZweDtcXHJcXG4gIGNvbG9yOiRncmF5O1xcclxcbn1cXHJcXG5cXHJcXG4ucGl6emEtcHJpY2UsIC5waXp6YS1udW1iZXJ7XFxyXFxuICBkaXNwbGF5OmJsb2NrO1xcclxcbiAgd2lkdGg6MTAwJTtcXHJcXG4gIGFsaWduLXNlbGY6Y2VudGVyO1xcclxcbiAgdGV4dC1hbGlnbjpjZW50ZXI7XFxyXFxuICBmb250LXNpemU6MThweDtcXHJcXG4gIGNvbG9yOiRkYXJrO1xcclxcbn1cXHJcXG5cXHJcXG4udG90YWx7XFxyXFxuICBwYWRkaW5nOjIwcHg7XFxyXFxuICAgdGV4dC1hbGlnbjpyaWdodDtcXHJcXG59XFxyXFxuXFxyXFxuLnRvdGFsIHNwYW57XFxyXFxuIGNvbG9yOiRwcmltYXJ5O1xcclxcbiBwYWRkaW5nOjAgNXB4O1xcclxcbn1cXHJcXG5cXHJcXG4uYWRkcmVzc3tcXHJcXG4gIG1hcmdpbjoxMHB4IDA7XFxyXFxuICB0ZXh0LWFsaWduOnJpZ2h0O1xcclxcbiAgcG9zaXRpb246cmVsYXRpdmU7XFxyXFxufVxcclxcblxcclxcbi5hZGRyZXNzIGlucHV0e1xcclxcbiAgd2lkdGg6NDAlO1xcclxcbiAgaGVpZ2h0OjIwcHg7XFxyXFxuICBwb3NpdGlvbjphYnNvbHV0ZTtcXHJcXG4gIHBhZGRpbmc6MTBweDtcXHJcXG4gIHJpZ2h0OjA7XFxyXFxuICBib3JkZXI6MXB4ICRncmF5IHNvbGlkO1xcclxcbiAgYm9yZGVyLXJhZGl1czoxcHg7XFxyXFxufVxcclxcblxcclxcbi5hZGRyZXNzIGJ1dHRvbntcXHJcXG4gIGJhY2tncm91bmQ6JHByaW1hcnk7XFxyXFxuICBjb2xvcjokcHVyZTtcXHJcXG4gIGJvcmRlci1yYWRpdXM6MTBweDtcXHJcXG4gIHBhZGRpbmc6N3B4O1xcclxcbiAgZm9udC1zaXplOjE1cHg7XFxyXFxuICBib3JkZXI6MXB4ICRncmF5IHNvbGlkO1xcclxcbiAgcG9zaXRpb246YWJzb2x1dGU7XFxyXFxuICB0b3A6NDBweDtcXHJcXG4gIHJpZ2h0OjA7XFxyXFxufVxcclxcblxcclxcbi8vbG9naW4gYW5kIHJlZ2lzdHJhdGlvblxcclxcblxcclxcbi5sb2dpbi1jb250YWluZXIsIC5yZWdpc3Rlci1jb250YWluZXJ7XFxyXFxuICBiYWNrZ3JvdW5kOiRzZWNvbmRhcnk7XFxyXFxufVxcclxcblxcclxcbi5sb2dpbi1jb250YWluZXIgaW5wdXQsIC5yZWdpc3Rlci1jb250YWluZXIgaW5wdXR7XFxyXFxuICBtYXJnaW46MjBweCBhdXRvO1xcclxcbn1cXHJcXG5cXHJcXG4ubG9naW4tYnV0dG9ue1xcclxcbiAgYmFja2dyb3VuZDokcHJpbWFyeTtcXHJcXG4gIGNvbG9yOiRwdXJlO1xcclxcbiAgZm9udC1zaXplOjE2cHg7XFxyXFxuICBwYWRkaW5nOjEwcHg7XFxyXFxuICBib3JkZXItcmFkaXVzOjEwcHg7XFxyXFxuICBib3JkZXI6MXB4ICRncmF5IHNvbGlkO1xcclxcbn1cXHJcXG5cXHJcXG4ubG9naW4tYnV0dG9uOmhvdmVye1xcclxcbiAgYmFja2dyb3VuZCA6IGJsYWNrO1xcclxcbn1cXHJcXG4uZm9yZ290LXB3e1xcclxcbiAgY29sb3I6JHByaW1hcnk7XFxyXFxuICBmb250LXdlaWdodDo3MDA7XFxyXFxufVxcclxcblxcclxcbi5mb3Jnb3QtcHc6aG92ZXJ7XFxyXFxuICBjb2xvcjokZGFyaztcXHJcXG59XFxyXFxuXFxyXFxuLmF1dGgtZXJyb3J7XFxyXFxuICBjb2xvcjpyZWQ7XFxyXFxuICBmb250LXNpemU6MTRweDtcXHJcXG4gIHBhZGRpbmc6MTBweDtcXHJcXG4gIHRleHQtYWxpZ246Y2VudGVyO1xcclxcbn1cXHJcXG5cXHJcXG4ubG9nZ2VkLWluLW5hbWV7XFxyXFxuICBmb250LXNpemU6IDE2cHg7XFxyXFxuZm9udC13ZWlnaHQ6IDUwMTtcXHJcXG5wb3NpdGlvbjogYWJzb2x1dGU7XFxyXFxudG9wOiAxMCU7XFxyXFxucmlnaHQ6IDklO1xcclxcbmNvbG9yOiBvcmFuZ2U7XFxyXFxufVxcclxcblxcclxcbi5ub3QtbG9nZ2VkLWluLW1zZ3tcXHJcXG4gIGNvbG9yIDogcmVkO1xcclxcbiAgZm9udC13ZWlnaHQgOiA2MDA7XFxyXFxuICBmb250LXNpemU6MTZweDtcXHJcXG4gIHBhZGRpbmc6MTBweDtcXHJcXG4gIHRleHQtYWxpZ246Y2VudGVyO1xcclxcbn1cXHJcXG5cXHJcXG4ubm90LWxvZ2dlZC1pbi1tc2cgYXtcXHJcXG4gIGNvbG9yOiBibHVlO1xcclxcbiAgdGV4dC1kZWNvcmF0aW9uOiB1bmRlcmxpbmU7XFxyXFxuICBkaXNwbGF5IDogaW5saW5lLWJsb2NrO1xcclxcbiAgcGFkZGluZzogMCA1cHg7XFxyXFxufVxcclxcblxcclxcbi5vcmRlci10aGVhZHtcXHJcXG4gIHBhZGRpbmcgOiA1cHg7XFxyXFxuICBib3JkZXIgOiAxcHggc29saWQgZ3JheTtcXHJcXG59XFxyXFxuXFxyXFxuLm9yZGVyLXRoZWFkIGRpdntcXHJcXG4gIGJvcmRlci1sZWZ0IDogMXB4IHNvbGlkIGdyYXk7XFxyXFxuICB0ZXh0LWFsaWduIDogY2VudGVyO1xcclxcbn1cXHJcXG5cXHJcXG4ub3JkZXItcm93e1xcclxcbiAgcGFkZGluZyA6IDVweDtcXHJcXG4gIHRyYW5zaXRpb246IGFsbCAzcyBlYXNlO1xcclxcbn1cXHJcXG5cXHJcXG4ub3JkZXItcm93IGRpdntcXHJcXG4gIHRleHQtYWxpZ24gOiBjZW50ZXI7XFxyXFxuICBwYWRkaW5nIDogM3B4O1xcclxcbiAgYm9yZGVyLWxlZnQgOiAxcHggc29saWQgZ3JheTtcXHJcXG4gIGJvcmRlci1ib3R0b206IDFweCBzb2xpZCBncmF5O1xcclxcbn1cXHJcXG5cXHJcXG5Aa2V5ZnJhbWVzIHNoYWtle1xcclxcbiAgMzMle1xcclxcbiAgICB0cmFuc2Zvcm0gOiByb3RhdGUoNTBkZWcpXFxyXFxuICB9XFxyXFxuXFxyXFxuICA2NiV7XFxyXFxuICAgIHRyYW5zZm9ybTogcm90YXRlKC01MGRlZylcXHJcXG4gIH1cXHJcXG59XFxyXFxuXFxyXFxuLnRyYWNrLWNvbnRhaW5lcntcXHJcXG4gIGJhY2tncm91bmQgOiAjZjhmOGY4O1xcclxcbiAgd2lkdGggOiAxMDAlO1xcclxcbiAgaGVpZ2h0IDogNjAwcHg7XFxyXFxufVxcclxcblxcclxcbi50cmFja2luZy1zZWN0aW9ue1xcclxcbiAgd2lkdGggOiA3MCU7XFxyXFxuICBtYXJnaW4gOiAyMHB4IGF1dG87XFxyXFxuICBwYWRkaW5nLXRvcCA6IDEwMHB4O1xcclxcbiAgaGVpZ2h0IDogNTAwcHg7XFxyXFxufVxcclxcblxcclxcbi5vcmRlci1pbmZve1xcclxcbiAgcG9zaXRpb246IHJlbGF0aXZlO1xcclxcbn1cXHJcXG5cXHJcXG4ub3JkZXItaW5mbyBoMXtcXHJcXG4gIGZvbnQtd2VpZ2h0OiA2MDA7XFxyXFxucG9zaXRpb246IGFic29sdXRlO1xcclxcbn1cXHJcXG5cXHJcXG4ub3JkZXItaW5mbyAub3JkZXItaWR7XFxyXFxuICBwb3NpdGlvbjogYWJzb2x1dGU7XFxyXFxuICAgIHJpZ2h0OiAwO1xcclxcbiAgICBjb2xvcjogb3JhbmdlO1xcclxcbn1cXHJcXG5cXHJcXG4ub3JkZXItc3RhdHVzIHtcXHJcXG4gIG1hcmdpbiA6IDUwcHg7XFxyXFxuICBwb3NpdGlvbjogcmVsYXRpdmU7XFxyXFxuICBsZWZ0OiAxOCU7XFxyXFxuICB0b3AgOiAzJTtcXHJcXG59XFxyXFxuXFxyXFxuLm9yZGVyLXN0YXR1cyBsaXtcXHJcXG4gIG1hcmdpbjogNTBweDtcXHJcXG4gIHdpZHRoIDogMzAwcHg7XFxyXFxuICAgIGZvbnQtc2l6ZTogMTZweDtcXHJcXG4gICAgcG9zaXRpb246IHJlbGF0aXZlO1xcclxcbiAgICBsZXR0ZXItc3BhY2luZzogMS41cHg7XFxyXFxufVxcclxcblxcclxcbi5vcmRlci1zdGF0dXMgbGkgLmljb257XFxyXFxuICBmb250LXNpemU6IDMwcHg7XFxyXFxuICBwb3NpdGlvbjogYWJzb2x1dGU7XFxyXFxuICByaWdodDogMDtcXHJcXG4gIHRvcCA6IC01cHg7XFxyXFxuICB0cmFuc2l0aW9uIDogdHJhbnNmb3JtIDJzIGVhc2U7XFxyXFxuICB0cmFuc2Zvcm0gOiBzY2FsZSgxLjIpO1xcclxcbn1cXHJcXG5cXHJcXG4ub3JkZXJzLXNtYWxse1xcclxcbiAgZGlzcGxheSA6IG5vbmU7XFxyXFxufVxcclxcblxcclxcbi5vcmRlci1zdGF0dXMgbGk6YmVmb3Jle1xcclxcbiAgY29udGVudCA6ICcnO1xcclxcbiAgYmFja2dyb3VuZCA6IGJsYWNrO1xcclxcbiAgYm9yZGVyLXJhZGl1cyA6IDUwJTtcXHJcXG4gIHdpZHRoIDogMTBweDtcXHJcXG4gIGhlaWdodCA6IDEwcHg7XFxyXFxuICByaWdodCA6IDg4cHg7XFxyXFxuICB0b3AgOiA3cHg7XFxyXFxuICBwb3NpdGlvbjogYWJzb2x1dGU7XFxyXFxufVxcclxcblxcclxcbi5vcmRlci1zdGF0dXMgbGk6YWZ0ZXJ7XFxyXFxuICBjb250ZW50OiBcXFwiXFxcIjtcXHJcXG4gICAgYmFja2dyb3VuZDogYmxhY2s7XFxyXFxuICAgIHdpZHRoOiAycHg7XFxyXFxuICAgIGhlaWdodDogMTg4JTtcXHJcXG4gICAgbWFyZ2luLXRvcDogMTVweDtcXHJcXG4gICAgcmlnaHQ6IDkycHg7XFxyXFxuICAgIHRvcDogMTBweDtcXHJcXG4gICAgcG9zaXRpb246IGFic29sdXRlO1xcclxcbn1cXHJcXG5cXHJcXG5cXHJcXG5AbWVkaWEgc2NyZWVuIGFuZCAobWF4LXdpZHRoIDogNjUwcHgpIHtcXHJcXG4gIC5tZW51LWl0ZW0gLml0ZW0tcHJpY2V7XFxyXFxuICAgIHRleHQtYWxpZ246IGNlbnRlcjtcXHJcXG4gIH1cXHJcXG4gIC5iYW5uZXIge1xcclxcbiAgICByaWdodDogMSU7XFxyXFxuICAgdG9wOiA0MSU7XFxyXFxuICAgd2lkdGg6IDQzJTtcXHJcXG4gICBoZWlnaHQ6IDE4MHB4O1xcclxcbiB9XFxyXFxuXFxyXFxuIC5vcmRlci1zdGF0dXN7XFxyXFxuICAgbWFyZ2luIDogMDtcXHJcXG4gICBsZWZ0IDogMDtcXHJcXG4gICB3aWR0aCA6IDEwMCU7XFxyXFxuICAgdG9wIDogNSU7XFxyXFxuIH1cXHJcXG5cXHJcXG4gLm9yZGVyLWluZm97XFxyXFxuICAgcGFkZGluZyA6IDEwcHg7XFxyXFxuIH1cXHJcXG5cXHJcXG4gLm9yZGVyLWluZm8gaDF7XFxyXFxuICAgcG9zaXRpb246IHN0YXRpYztcXHJcXG4gICBmb250LXNpemUgOiAxNHB4O1xcclxcbiB9XFxyXFxuXFxyXFxuIC5vcmRlci1pbmZvIC5vcmRlci1pZHtcXHJcXG4gICBwb3NpdGlvbjogc3RhdGljO1xcclxcbiAgIGZvbnQtc2l6ZSA6IDEzcHg7XFxyXFxuIH1cXHJcXG5cXHJcXG4gLnRyYWNraW5nLXNlY3Rpb257XFxyXFxuICAgcGFkZGluZy10b3AgOiAzNnB4O1xcclxcbiB9XFxyXFxuXFxyXFxuIC5vcmRlci1zdGF0dXMgbGkge1xcclxcbiAgIGZvbnQtc2l6ZTogMTNweDtcXHJcXG4gICBtYXJnaW4gOiAzMHB4O1xcclxcbiB9XFxyXFxuXFxyXFxuIC50cmFja2luZy1jb250YWluZXJ7XFxyXFxuICAgaGVpZ2h0IDogNDUwcHg7XFxyXFxuIH1cXHJcXG5cXHJcXG4gLnRyYWNraW5nLXNlY3Rpb257XFxyXFxuICAgd2lkdGggOiAxMDAlO1xcclxcbiB9XFxyXFxuXFxyXFxuIC5vcmRlcnMtc21hbGx7XFxyXFxuICAgZGlzcGxheTogYmxvY2s7XFxyXFxuIH1cXHJcXG4gLnN1Y2Nlc3MtYWxlcnR7XFxyXFxuICAgZm9udC1zaXplOiAxNHB4O1xcclxcbiB9XFxyXFxuIC5vcmRlcnN7XFxyXFxuICAgZGlzcGxheSA6IG5vbmU7XFxyXFxuIH1cXHJcXG4gLmF1dGgtZXJyb3J7XFxyXFxuICAgZm9udC1zaXplOiAxM3B4O1xcclxcbiB9XFxyXFxuICAuY2FwdGlvbntcXHJcXG4gICAgZm9udC1zaXplOiAxNHB4O1xcclxcbiAgICB0b3A6IDE3JTtcXHJcXG4gICAgbGVmdDogNCU7XFxyXFxufVxcclxcbi5vcmRlcntcXHJcXG4gIHdpZHRoIDogNTAlO1xcclxcbn1cXHJcXG4uY2FwdGlvbiBoMXtcXHJcXG4gIGZvbnQtc2l6ZSA6IDM1cHg7XFxyXFxufVxcclxcbi5pbnRyby1jb250YWluZXJ7XFxyXFxuICBoZWlnaHQgOiA1MCU7XFxyXFxufVxcclxcbi5tZW51LWNvbnRhaW5lciBoMntcXHJcXG4gIGZvbnQtc2l6ZSA6IDIwcHg7XFxyXFxufVxcclxcbi5tZW51LWl0ZW0gaW1ne1xcclxcbiAgaGVpZ2h0IDogOTBweDtcXHJcXG59XFxyXFxuLm1lbnUtaXRlbSAuaXRlbS1uYW1le1xcclxcbiAgZm9udC1zaXplIDogMTRweDtcXHJcXG59XFxyXFxuLmxvZ28td3JhcHBlciBpbWd7XFxyXFxuICBtYXJnaW46IDVweDtcXHJcXG4gICAgZGlzcGxheTogaW5saW5lO1xcclxcbiAgICBoZWlnaHQ6IDEwMHB4O1xcclxcbn1cXHJcXG4ubG9nby13cmFwcGVye1xcclxcbiAgcG9zaXRpb24gOiBzdGF0aWM7XFxyXFxuICB0ZXh0LWFsaWduIDogY2VudGVyO1xcclxcbiAgZGlzcGxheSA6IGJsb2NrO1xcclxcbn1cXHJcXG4ubG9nby13cmFwcGVyIHNwYW57XFxyXFxuICBwb3NpdGlvbjogc3RhdGljO1xcclxcbn1cXHJcXG4ubmF2LXdyYXBwZXJ7XFxyXFxuICBkaXNwbGF5OiBibG9jaztcXHJcXG4gIHRleHQtYWxpZ246IGNlbnRlcjtcXHJcXG4gIHBvc2l0aW9uOiBzdGF0aWM7XFxyXFxufVxcclxcbi5jYXJ0LW5vbmVtcHR5IGgxe1xcclxcbiAgZm9udC1zaXplOiAxNnB4O1xcclxcbn1cXHJcXG4ubm90LWxvZ2dlZC1pbi1tc2d7XFxyXFxuICBmb250LXNpemU6IDE0cHg7XFxyXFxuICBwYWRkaW5nOiAwO1xcclxcbn1cXHJcXG4ucGl6emEtbmFtZSwgLnBpenphLXNpemUsIC5waXp6YS1udW1iZXIsIC5waXp6YS1wcmljZXtcXHJcXG4gIGZvbnQtc2l6ZTogMTRweDtcXHJcXG59XFxyXFxuLmNhcnQtbm9uZW1wdHl7XFxyXFxuICBtaW4taGVpZ2h0IDogMDtcXHJcXG59XFxyXFxuLnNpZ24taW4tbXNne1xcclxcbiAgZm9udC1zaXplIDogMTZweDtcXHJcXG59XFxyXFxuXFxyXFxuLmxvZ2luLWNvbnRhaW5lciBpbnB1dCwgLnJlZ2lzdGVyLWNvbnRhaW5lciBpbnB1dHtcXHJcXG4gIHBhZGRpbmc6IDVweDtcXHJcXG4gICAgZm9udC1zaXplOiAxM3B4O1xcclxcbiAgICBtYXJnaW46IDIwcHggYXV0bztcXHJcXG59XFxyXFxuLmxvZ2luLWJ1dHRvbntcXHJcXG4gIGZvbnQtc2l6ZSA6IDE0cHg7XFxyXFxufVxcclxcbi5hZGRyZXNzIGlucHV0e1xcclxcbiAgd2lkdGggOiA2MCU7XFxyXFxufVxcclxcbi5hZGRyZXNzIGJ1dHRvbntcXHJcXG4gIGZvbnQtc2l6ZTogMTNweDtcXHJcXG59XFxyXFxuLmxvZ2dlZC1pbi1uYW1le1xcclxcbiAgZm9udC1zaXplOiAxM3B4O1xcclxcbiAgdG9wOiA1JTtcXHJcXG59XFxyXFxuLmNhcnQtZW1wdHkgcHtcXHJcXG4gIGZvbnQtc2l6ZSA6IDE0cHg7XFxyXFxufVxcclxcbi5jYXJ0LWVtcHR5IGgxe1xcclxcbiAgZm9udC1zaXplOiAyMHB4O1xcclxcbn1cXHJcXG4uY2FydC1lbXB0eSBhe1xcclxcbiAgZm9udC1zaXplOiAxM3B4O1xcclxcbn1cXHJcXG4uZm9yZ290LXB3e1xcclxcbiAgZm9udC1zaXplOiAxNXB4O1xcclxcbn1cXHJcXG59XFxyXFxuXCIsXCIubm90eV90aGVtZV9fbWludC5ub3R5X2JhciB7XFxyXFxuICBtYXJnaW46IDRweCAwO1xcclxcbiAgb3ZlcmZsb3c6IGhpZGRlbjtcXHJcXG4gIGJvcmRlci1yYWRpdXM6IDJweDtcXHJcXG4gIHBvc2l0aW9uOiByZWxhdGl2ZTtcXHJcXG5cXHJcXG4gIC5ub3R5X2JvZHkge1xcclxcblxcdHBhZGRpbmc6IDEwcHg7XFxyXFxuXFx0Zm9udC1zaXplOiAxNHB4O1xcclxcbiAgfVxcclxcblxcclxcbiAgLm5vdHlfYnV0dG9ucyB7XFxyXFxuXFx0cGFkZGluZzogMTBweDtcXHJcXG4gIH1cXHJcXG59XFxyXFxuXFxyXFxuLm5vdHlfdGhlbWVfX21pbnQubm90eV90eXBlX19hbGVydCxcXHJcXG4ubm90eV90aGVtZV9fbWludC5ub3R5X3R5cGVfX25vdGlmaWNhdGlvbiB7XFxyXFxuICBiYWNrZ3JvdW5kLWNvbG9yOiAjZmZmO1xcclxcbiAgYm9yZGVyLWJvdHRvbTogMXB4IHNvbGlkICNEMUQxRDE7XFxyXFxuICBjb2xvcjogIzJGMkYyRjtcXHJcXG59XFxyXFxuXFxyXFxuLm5vdHlfdGhlbWVfX21pbnQubm90eV90eXBlX193YXJuaW5nIHtcXHJcXG4gIGJhY2tncm91bmQtY29sb3I6ICNGRkFFNDI7XFxyXFxuICBib3JkZXItYm90dG9tOiAxcHggc29saWQgI0U4OUYzQztcXHJcXG4gIGNvbG9yOiAjZmZmO1xcclxcbn1cXHJcXG5cXHJcXG4ubm90eV90aGVtZV9fbWludC5ub3R5X3R5cGVfX2Vycm9yIHtcXHJcXG4gIGJhY2tncm91bmQtY29sb3I6ICNERTYzNkY7XFxyXFxuICBib3JkZXItYm90dG9tOiAxcHggc29saWQgI0NBNUE2NTtcXHJcXG4gIGNvbG9yOiAjZmZmO1xcclxcbn1cXHJcXG5cXHJcXG4ubm90eV90aGVtZV9fbWludC5ub3R5X3R5cGVfX2luZm8sXFxyXFxuLm5vdHlfdGhlbWVfX21pbnQubm90eV90eXBlX19pbmZvcm1hdGlvbiB7XFxyXFxuICBiYWNrZ3JvdW5kLWNvbG9yOiAjN0Y3RUZGO1xcclxcbiAgYm9yZGVyLWJvdHRvbTogMXB4IHNvbGlkICM3NDczRTg7XFxyXFxuICBjb2xvcjogI2ZmZjtcXHJcXG59XFxyXFxuXFxyXFxuLm5vdHlfdGhlbWVfX21pbnQubm90eV90eXBlX19zdWNjZXNzIHtcXHJcXG4gIGJhY2tncm91bmQtY29sb3I6ICNBRkM3NjU7XFxyXFxuICBib3JkZXItYm90dG9tOiAxcHggc29saWQgI0EwQjU1QztcXHJcXG4gIGNvbG9yOiAjZmZmO1xcclxcbn1cXHJcXG5cIixcIi8vIENvbG9yc1xcclxcbiRwcmltYXJ5OiAjRkU1RjFFO1xcclxcbiRwcmltYXJ5LWhvdmVyOiAjYjIzMzAxO1xcclxcbiRzZWNvbmRhcnk6ICNmOGY4Zjg7XFxyXFxuJHB1cmU6I2ZmZjtcXHJcXG4kZGFyazojMjMyMzIzO1xcclxcbiRncmF5OiNjY2M7XFxyXFxuXCJdLFwic291cmNlUm9vdFwiOlwiXCJ9XSk7XG4vLyBFeHBvcnRzXG5leHBvcnQgZGVmYXVsdCBfX19DU1NfTE9BREVSX0VYUE9SVF9fXztcbiIsIlwidXNlIHN0cmljdFwiO1xuXG4vKlxuICBNSVQgTGljZW5zZSBodHRwOi8vd3d3Lm9wZW5zb3VyY2Uub3JnL2xpY2Vuc2VzL21pdC1saWNlbnNlLnBocFxuICBBdXRob3IgVG9iaWFzIEtvcHBlcnMgQHNva3JhXG4qL1xuLy8gY3NzIGJhc2UgY29kZSwgaW5qZWN0ZWQgYnkgdGhlIGNzcy1sb2FkZXJcbi8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBmdW5jLW5hbWVzXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChjc3NXaXRoTWFwcGluZ1RvU3RyaW5nKSB7XG4gIHZhciBsaXN0ID0gW107IC8vIHJldHVybiB0aGUgbGlzdCBvZiBtb2R1bGVzIGFzIGNzcyBzdHJpbmdcblxuICBsaXN0LnRvU3RyaW5nID0gZnVuY3Rpb24gdG9TdHJpbmcoKSB7XG4gICAgcmV0dXJuIHRoaXMubWFwKGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgICB2YXIgY29udGVudCA9IGNzc1dpdGhNYXBwaW5nVG9TdHJpbmcoaXRlbSk7XG5cbiAgICAgIGlmIChpdGVtWzJdKSB7XG4gICAgICAgIHJldHVybiBcIkBtZWRpYSBcIi5jb25jYXQoaXRlbVsyXSwgXCIge1wiKS5jb25jYXQoY29udGVudCwgXCJ9XCIpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gY29udGVudDtcbiAgICB9KS5qb2luKCcnKTtcbiAgfTsgLy8gaW1wb3J0IGEgbGlzdCBvZiBtb2R1bGVzIGludG8gdGhlIGxpc3RcbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGZ1bmMtbmFtZXNcblxuXG4gIGxpc3QuaSA9IGZ1bmN0aW9uIChtb2R1bGVzLCBtZWRpYVF1ZXJ5LCBkZWR1cGUpIHtcbiAgICBpZiAodHlwZW9mIG1vZHVsZXMgPT09ICdzdHJpbmcnKSB7XG4gICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tcGFyYW0tcmVhc3NpZ25cbiAgICAgIG1vZHVsZXMgPSBbW251bGwsIG1vZHVsZXMsICcnXV07XG4gICAgfVxuXG4gICAgdmFyIGFscmVhZHlJbXBvcnRlZE1vZHVsZXMgPSB7fTtcblxuICAgIGlmIChkZWR1cGUpIHtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgcHJlZmVyLWRlc3RydWN0dXJpbmdcbiAgICAgICAgdmFyIGlkID0gdGhpc1tpXVswXTtcblxuICAgICAgICBpZiAoaWQgIT0gbnVsbCkge1xuICAgICAgICAgIGFscmVhZHlJbXBvcnRlZE1vZHVsZXNbaWRdID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGZvciAodmFyIF9pID0gMDsgX2kgPCBtb2R1bGVzLmxlbmd0aDsgX2krKykge1xuICAgICAgdmFyIGl0ZW0gPSBbXS5jb25jYXQobW9kdWxlc1tfaV0pO1xuXG4gICAgICBpZiAoZGVkdXBlICYmIGFscmVhZHlJbXBvcnRlZE1vZHVsZXNbaXRlbVswXV0pIHtcbiAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWNvbnRpbnVlXG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICBpZiAobWVkaWFRdWVyeSkge1xuICAgICAgICBpZiAoIWl0ZW1bMl0pIHtcbiAgICAgICAgICBpdGVtWzJdID0gbWVkaWFRdWVyeTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpdGVtWzJdID0gXCJcIi5jb25jYXQobWVkaWFRdWVyeSwgXCIgYW5kIFwiKS5jb25jYXQoaXRlbVsyXSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgbGlzdC5wdXNoKGl0ZW0pO1xuICAgIH1cbiAgfTtcblxuICByZXR1cm4gbGlzdDtcbn07IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbmZ1bmN0aW9uIF9zbGljZWRUb0FycmF5KGFyciwgaSkgeyByZXR1cm4gX2FycmF5V2l0aEhvbGVzKGFycikgfHwgX2l0ZXJhYmxlVG9BcnJheUxpbWl0KGFyciwgaSkgfHwgX3Vuc3VwcG9ydGVkSXRlcmFibGVUb0FycmF5KGFyciwgaSkgfHwgX25vbkl0ZXJhYmxlUmVzdCgpOyB9XG5cbmZ1bmN0aW9uIF9ub25JdGVyYWJsZVJlc3QoKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJJbnZhbGlkIGF0dGVtcHQgdG8gZGVzdHJ1Y3R1cmUgbm9uLWl0ZXJhYmxlIGluc3RhbmNlLlxcbkluIG9yZGVyIHRvIGJlIGl0ZXJhYmxlLCBub24tYXJyYXkgb2JqZWN0cyBtdXN0IGhhdmUgYSBbU3ltYm9sLml0ZXJhdG9yXSgpIG1ldGhvZC5cIik7IH1cblxuZnVuY3Rpb24gX3Vuc3VwcG9ydGVkSXRlcmFibGVUb0FycmF5KG8sIG1pbkxlbikgeyBpZiAoIW8pIHJldHVybjsgaWYgKHR5cGVvZiBvID09PSBcInN0cmluZ1wiKSByZXR1cm4gX2FycmF5TGlrZVRvQXJyYXkobywgbWluTGVuKTsgdmFyIG4gPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwobykuc2xpY2UoOCwgLTEpOyBpZiAobiA9PT0gXCJPYmplY3RcIiAmJiBvLmNvbnN0cnVjdG9yKSBuID0gby5jb25zdHJ1Y3Rvci5uYW1lOyBpZiAobiA9PT0gXCJNYXBcIiB8fCBuID09PSBcIlNldFwiKSByZXR1cm4gQXJyYXkuZnJvbShvKTsgaWYgKG4gPT09IFwiQXJndW1lbnRzXCIgfHwgL14oPzpVaXxJKW50KD86OHwxNnwzMikoPzpDbGFtcGVkKT9BcnJheSQvLnRlc3QobikpIHJldHVybiBfYXJyYXlMaWtlVG9BcnJheShvLCBtaW5MZW4pOyB9XG5cbmZ1bmN0aW9uIF9hcnJheUxpa2VUb0FycmF5KGFyciwgbGVuKSB7IGlmIChsZW4gPT0gbnVsbCB8fCBsZW4gPiBhcnIubGVuZ3RoKSBsZW4gPSBhcnIubGVuZ3RoOyBmb3IgKHZhciBpID0gMCwgYXJyMiA9IG5ldyBBcnJheShsZW4pOyBpIDwgbGVuOyBpKyspIHsgYXJyMltpXSA9IGFycltpXTsgfSByZXR1cm4gYXJyMjsgfVxuXG5mdW5jdGlvbiBfaXRlcmFibGVUb0FycmF5TGltaXQoYXJyLCBpKSB7IGlmICh0eXBlb2YgU3ltYm9sID09PSBcInVuZGVmaW5lZFwiIHx8ICEoU3ltYm9sLml0ZXJhdG9yIGluIE9iamVjdChhcnIpKSkgcmV0dXJuOyB2YXIgX2FyciA9IFtdOyB2YXIgX24gPSB0cnVlOyB2YXIgX2QgPSBmYWxzZTsgdmFyIF9lID0gdW5kZWZpbmVkOyB0cnkgeyBmb3IgKHZhciBfaSA9IGFycltTeW1ib2wuaXRlcmF0b3JdKCksIF9zOyAhKF9uID0gKF9zID0gX2kubmV4dCgpKS5kb25lKTsgX24gPSB0cnVlKSB7IF9hcnIucHVzaChfcy52YWx1ZSk7IGlmIChpICYmIF9hcnIubGVuZ3RoID09PSBpKSBicmVhazsgfSB9IGNhdGNoIChlcnIpIHsgX2QgPSB0cnVlOyBfZSA9IGVycjsgfSBmaW5hbGx5IHsgdHJ5IHsgaWYgKCFfbiAmJiBfaVtcInJldHVyblwiXSAhPSBudWxsKSBfaVtcInJldHVyblwiXSgpOyB9IGZpbmFsbHkgeyBpZiAoX2QpIHRocm93IF9lOyB9IH0gcmV0dXJuIF9hcnI7IH1cblxuZnVuY3Rpb24gX2FycmF5V2l0aEhvbGVzKGFycikgeyBpZiAoQXJyYXkuaXNBcnJheShhcnIpKSByZXR1cm4gYXJyOyB9XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gY3NzV2l0aE1hcHBpbmdUb1N0cmluZyhpdGVtKSB7XG4gIHZhciBfaXRlbSA9IF9zbGljZWRUb0FycmF5KGl0ZW0sIDQpLFxuICAgICAgY29udGVudCA9IF9pdGVtWzFdLFxuICAgICAgY3NzTWFwcGluZyA9IF9pdGVtWzNdO1xuXG4gIGlmICh0eXBlb2YgYnRvYSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby11bmRlZlxuICAgIHZhciBiYXNlNjQgPSBidG9hKHVuZXNjYXBlKGVuY29kZVVSSUNvbXBvbmVudChKU09OLnN0cmluZ2lmeShjc3NNYXBwaW5nKSkpKTtcbiAgICB2YXIgZGF0YSA9IFwic291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247Y2hhcnNldD11dGYtODtiYXNlNjQsXCIuY29uY2F0KGJhc2U2NCk7XG4gICAgdmFyIHNvdXJjZU1hcHBpbmcgPSBcIi8qIyBcIi5jb25jYXQoZGF0YSwgXCIgKi9cIik7XG4gICAgdmFyIHNvdXJjZVVSTHMgPSBjc3NNYXBwaW5nLnNvdXJjZXMubWFwKGZ1bmN0aW9uIChzb3VyY2UpIHtcbiAgICAgIHJldHVybiBcIi8qIyBzb3VyY2VVUkw9XCIuY29uY2F0KGNzc01hcHBpbmcuc291cmNlUm9vdCB8fCAnJykuY29uY2F0KHNvdXJjZSwgXCIgKi9cIik7XG4gICAgfSk7XG4gICAgcmV0dXJuIFtjb250ZW50XS5jb25jYXQoc291cmNlVVJMcykuY29uY2F0KFtzb3VyY2VNYXBwaW5nXSkuam9pbignXFxuJyk7XG4gIH1cblxuICByZXR1cm4gW2NvbnRlbnRdLmpvaW4oJ1xcbicpO1xufTsiLCJpbXBvcnQgYXBpIGZyb20gXCIhLi4vLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvaW5qZWN0U3R5bGVzSW50b1N0eWxlVGFnLmpzXCI7XG4gICAgICAgICAgICBpbXBvcnQgY29udGVudCBmcm9tIFwiISEuLi8uLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L2Nqcy5qcyEuLi8uLi9ub2RlX21vZHVsZXMvc2Fzcy1sb2FkZXIvZGlzdC9janMuanMhLi9zY3NzLnNjc3NcIjtcblxudmFyIG9wdGlvbnMgPSB7fTtcblxub3B0aW9ucy5pbnNlcnQgPSBcImhlYWRcIjtcbm9wdGlvbnMuc2luZ2xldG9uID0gZmFsc2U7XG5cbnZhciB1cGRhdGUgPSBhcGkoY29udGVudCwgb3B0aW9ucyk7XG5cblxuXG5leHBvcnQgZGVmYXVsdCBjb250ZW50LmxvY2FscyB8fCB7fTsiLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIGlzT2xkSUUgPSBmdW5jdGlvbiBpc09sZElFKCkge1xuICB2YXIgbWVtbztcbiAgcmV0dXJuIGZ1bmN0aW9uIG1lbW9yaXplKCkge1xuICAgIGlmICh0eXBlb2YgbWVtbyA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIC8vIFRlc3QgZm9yIElFIDw9IDkgYXMgcHJvcG9zZWQgYnkgQnJvd3NlcmhhY2tzXG4gICAgICAvLyBAc2VlIGh0dHA6Ly9icm93c2VyaGFja3MuY29tLyNoYWNrLWU3MWQ4NjkyZjY1MzM0MTczZmVlNzE1YzIyMmNiODA1XG4gICAgICAvLyBUZXN0cyBmb3IgZXhpc3RlbmNlIG9mIHN0YW5kYXJkIGdsb2JhbHMgaXMgdG8gYWxsb3cgc3R5bGUtbG9hZGVyXG4gICAgICAvLyB0byBvcGVyYXRlIGNvcnJlY3RseSBpbnRvIG5vbi1zdGFuZGFyZCBlbnZpcm9ubWVudHNcbiAgICAgIC8vIEBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3dlYnBhY2stY29udHJpYi9zdHlsZS1sb2FkZXIvaXNzdWVzLzE3N1xuICAgICAgbWVtbyA9IEJvb2xlYW4od2luZG93ICYmIGRvY3VtZW50ICYmIGRvY3VtZW50LmFsbCAmJiAhd2luZG93LmF0b2IpO1xuICAgIH1cblxuICAgIHJldHVybiBtZW1vO1xuICB9O1xufSgpO1xuXG52YXIgZ2V0VGFyZ2V0ID0gZnVuY3Rpb24gZ2V0VGFyZ2V0KCkge1xuICB2YXIgbWVtbyA9IHt9O1xuICByZXR1cm4gZnVuY3Rpb24gbWVtb3JpemUodGFyZ2V0KSB7XG4gICAgaWYgKHR5cGVvZiBtZW1vW3RhcmdldF0gPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICB2YXIgc3R5bGVUYXJnZXQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHRhcmdldCk7IC8vIFNwZWNpYWwgY2FzZSB0byByZXR1cm4gaGVhZCBvZiBpZnJhbWUgaW5zdGVhZCBvZiBpZnJhbWUgaXRzZWxmXG5cbiAgICAgIGlmICh3aW5kb3cuSFRNTElGcmFtZUVsZW1lbnQgJiYgc3R5bGVUYXJnZXQgaW5zdGFuY2VvZiB3aW5kb3cuSFRNTElGcmFtZUVsZW1lbnQpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAvLyBUaGlzIHdpbGwgdGhyb3cgYW4gZXhjZXB0aW9uIGlmIGFjY2VzcyB0byBpZnJhbWUgaXMgYmxvY2tlZFxuICAgICAgICAgIC8vIGR1ZSB0byBjcm9zcy1vcmlnaW4gcmVzdHJpY3Rpb25zXG4gICAgICAgICAgc3R5bGVUYXJnZXQgPSBzdHlsZVRhcmdldC5jb250ZW50RG9jdW1lbnQuaGVhZDtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgIC8vIGlzdGFuYnVsIGlnbm9yZSBuZXh0XG4gICAgICAgICAgc3R5bGVUYXJnZXQgPSBudWxsO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIG1lbW9bdGFyZ2V0XSA9IHN0eWxlVGFyZ2V0O1xuICAgIH1cblxuICAgIHJldHVybiBtZW1vW3RhcmdldF07XG4gIH07XG59KCk7XG5cbnZhciBzdHlsZXNJbkRvbSA9IFtdO1xuXG5mdW5jdGlvbiBnZXRJbmRleEJ5SWRlbnRpZmllcihpZGVudGlmaWVyKSB7XG4gIHZhciByZXN1bHQgPSAtMTtcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IHN0eWxlc0luRG9tLmxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKHN0eWxlc0luRG9tW2ldLmlkZW50aWZpZXIgPT09IGlkZW50aWZpZXIpIHtcbiAgICAgIHJlc3VsdCA9IGk7XG4gICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5mdW5jdGlvbiBtb2R1bGVzVG9Eb20obGlzdCwgb3B0aW9ucykge1xuICB2YXIgaWRDb3VudE1hcCA9IHt9O1xuICB2YXIgaWRlbnRpZmllcnMgPSBbXTtcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgaXRlbSA9IGxpc3RbaV07XG4gICAgdmFyIGlkID0gb3B0aW9ucy5iYXNlID8gaXRlbVswXSArIG9wdGlvbnMuYmFzZSA6IGl0ZW1bMF07XG4gICAgdmFyIGNvdW50ID0gaWRDb3VudE1hcFtpZF0gfHwgMDtcbiAgICB2YXIgaWRlbnRpZmllciA9IFwiXCIuY29uY2F0KGlkLCBcIiBcIikuY29uY2F0KGNvdW50KTtcbiAgICBpZENvdW50TWFwW2lkXSA9IGNvdW50ICsgMTtcbiAgICB2YXIgaW5kZXggPSBnZXRJbmRleEJ5SWRlbnRpZmllcihpZGVudGlmaWVyKTtcbiAgICB2YXIgb2JqID0ge1xuICAgICAgY3NzOiBpdGVtWzFdLFxuICAgICAgbWVkaWE6IGl0ZW1bMl0sXG4gICAgICBzb3VyY2VNYXA6IGl0ZW1bM11cbiAgICB9O1xuXG4gICAgaWYgKGluZGV4ICE9PSAtMSkge1xuICAgICAgc3R5bGVzSW5Eb21baW5kZXhdLnJlZmVyZW5jZXMrKztcbiAgICAgIHN0eWxlc0luRG9tW2luZGV4XS51cGRhdGVyKG9iaik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHN0eWxlc0luRG9tLnB1c2goe1xuICAgICAgICBpZGVudGlmaWVyOiBpZGVudGlmaWVyLFxuICAgICAgICB1cGRhdGVyOiBhZGRTdHlsZShvYmosIG9wdGlvbnMpLFxuICAgICAgICByZWZlcmVuY2VzOiAxXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBpZGVudGlmaWVycy5wdXNoKGlkZW50aWZpZXIpO1xuICB9XG5cbiAgcmV0dXJuIGlkZW50aWZpZXJzO1xufVxuXG5mdW5jdGlvbiBpbnNlcnRTdHlsZUVsZW1lbnQob3B0aW9ucykge1xuICB2YXIgc3R5bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzdHlsZScpO1xuICB2YXIgYXR0cmlidXRlcyA9IG9wdGlvbnMuYXR0cmlidXRlcyB8fCB7fTtcblxuICBpZiAodHlwZW9mIGF0dHJpYnV0ZXMubm9uY2UgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgdmFyIG5vbmNlID0gdHlwZW9mIF9fd2VicGFja19ub25jZV9fICE9PSAndW5kZWZpbmVkJyA/IF9fd2VicGFja19ub25jZV9fIDogbnVsbDtcblxuICAgIGlmIChub25jZSkge1xuICAgICAgYXR0cmlidXRlcy5ub25jZSA9IG5vbmNlO1xuICAgIH1cbiAgfVxuXG4gIE9iamVjdC5rZXlzKGF0dHJpYnV0ZXMpLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xuICAgIHN0eWxlLnNldEF0dHJpYnV0ZShrZXksIGF0dHJpYnV0ZXNba2V5XSk7XG4gIH0pO1xuXG4gIGlmICh0eXBlb2Ygb3B0aW9ucy5pbnNlcnQgPT09ICdmdW5jdGlvbicpIHtcbiAgICBvcHRpb25zLmluc2VydChzdHlsZSk7XG4gIH0gZWxzZSB7XG4gICAgdmFyIHRhcmdldCA9IGdldFRhcmdldChvcHRpb25zLmluc2VydCB8fCAnaGVhZCcpO1xuXG4gICAgaWYgKCF0YXJnZXQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIkNvdWxkbid0IGZpbmQgYSBzdHlsZSB0YXJnZXQuIFRoaXMgcHJvYmFibHkgbWVhbnMgdGhhdCB0aGUgdmFsdWUgZm9yIHRoZSAnaW5zZXJ0JyBwYXJhbWV0ZXIgaXMgaW52YWxpZC5cIik7XG4gICAgfVxuXG4gICAgdGFyZ2V0LmFwcGVuZENoaWxkKHN0eWxlKTtcbiAgfVxuXG4gIHJldHVybiBzdHlsZTtcbn1cblxuZnVuY3Rpb24gcmVtb3ZlU3R5bGVFbGVtZW50KHN0eWxlKSB7XG4gIC8vIGlzdGFuYnVsIGlnbm9yZSBpZlxuICBpZiAoc3R5bGUucGFyZW50Tm9kZSA9PT0gbnVsbCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHN0eWxlLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoc3R5bGUpO1xufVxuLyogaXN0YW5idWwgaWdub3JlIG5leHQgICovXG5cblxudmFyIHJlcGxhY2VUZXh0ID0gZnVuY3Rpb24gcmVwbGFjZVRleHQoKSB7XG4gIHZhciB0ZXh0U3RvcmUgPSBbXTtcbiAgcmV0dXJuIGZ1bmN0aW9uIHJlcGxhY2UoaW5kZXgsIHJlcGxhY2VtZW50KSB7XG4gICAgdGV4dFN0b3JlW2luZGV4XSA9IHJlcGxhY2VtZW50O1xuICAgIHJldHVybiB0ZXh0U3RvcmUuZmlsdGVyKEJvb2xlYW4pLmpvaW4oJ1xcbicpO1xuICB9O1xufSgpO1xuXG5mdW5jdGlvbiBhcHBseVRvU2luZ2xldG9uVGFnKHN0eWxlLCBpbmRleCwgcmVtb3ZlLCBvYmopIHtcbiAgdmFyIGNzcyA9IHJlbW92ZSA/ICcnIDogb2JqLm1lZGlhID8gXCJAbWVkaWEgXCIuY29uY2F0KG9iai5tZWRpYSwgXCIge1wiKS5jb25jYXQob2JqLmNzcywgXCJ9XCIpIDogb2JqLmNzczsgLy8gRm9yIG9sZCBJRVxuXG4gIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAgKi9cblxuICBpZiAoc3R5bGUuc3R5bGVTaGVldCkge1xuICAgIHN0eWxlLnN0eWxlU2hlZXQuY3NzVGV4dCA9IHJlcGxhY2VUZXh0KGluZGV4LCBjc3MpO1xuICB9IGVsc2Uge1xuICAgIHZhciBjc3NOb2RlID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoY3NzKTtcbiAgICB2YXIgY2hpbGROb2RlcyA9IHN0eWxlLmNoaWxkTm9kZXM7XG5cbiAgICBpZiAoY2hpbGROb2Rlc1tpbmRleF0pIHtcbiAgICAgIHN0eWxlLnJlbW92ZUNoaWxkKGNoaWxkTm9kZXNbaW5kZXhdKTtcbiAgICB9XG5cbiAgICBpZiAoY2hpbGROb2Rlcy5sZW5ndGgpIHtcbiAgICAgIHN0eWxlLmluc2VydEJlZm9yZShjc3NOb2RlLCBjaGlsZE5vZGVzW2luZGV4XSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHN0eWxlLmFwcGVuZENoaWxkKGNzc05vZGUpO1xuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBhcHBseVRvVGFnKHN0eWxlLCBvcHRpb25zLCBvYmopIHtcbiAgdmFyIGNzcyA9IG9iai5jc3M7XG4gIHZhciBtZWRpYSA9IG9iai5tZWRpYTtcbiAgdmFyIHNvdXJjZU1hcCA9IG9iai5zb3VyY2VNYXA7XG5cbiAgaWYgKG1lZGlhKSB7XG4gICAgc3R5bGUuc2V0QXR0cmlidXRlKCdtZWRpYScsIG1lZGlhKTtcbiAgfSBlbHNlIHtcbiAgICBzdHlsZS5yZW1vdmVBdHRyaWJ1dGUoJ21lZGlhJyk7XG4gIH1cblxuICBpZiAoc291cmNlTWFwICYmIHR5cGVvZiBidG9hICE9PSAndW5kZWZpbmVkJykge1xuICAgIGNzcyArPSBcIlxcbi8qIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsXCIuY29uY2F0KGJ0b2EodW5lc2NhcGUoZW5jb2RlVVJJQ29tcG9uZW50KEpTT04uc3RyaW5naWZ5KHNvdXJjZU1hcCkpKSksIFwiICovXCIpO1xuICB9IC8vIEZvciBvbGQgSUVcblxuICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgICovXG5cblxuICBpZiAoc3R5bGUuc3R5bGVTaGVldCkge1xuICAgIHN0eWxlLnN0eWxlU2hlZXQuY3NzVGV4dCA9IGNzcztcbiAgfSBlbHNlIHtcbiAgICB3aGlsZSAoc3R5bGUuZmlyc3RDaGlsZCkge1xuICAgICAgc3R5bGUucmVtb3ZlQ2hpbGQoc3R5bGUuZmlyc3RDaGlsZCk7XG4gICAgfVxuXG4gICAgc3R5bGUuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoY3NzKSk7XG4gIH1cbn1cblxudmFyIHNpbmdsZXRvbiA9IG51bGw7XG52YXIgc2luZ2xldG9uQ291bnRlciA9IDA7XG5cbmZ1bmN0aW9uIGFkZFN0eWxlKG9iaiwgb3B0aW9ucykge1xuICB2YXIgc3R5bGU7XG4gIHZhciB1cGRhdGU7XG4gIHZhciByZW1vdmU7XG5cbiAgaWYgKG9wdGlvbnMuc2luZ2xldG9uKSB7XG4gICAgdmFyIHN0eWxlSW5kZXggPSBzaW5nbGV0b25Db3VudGVyKys7XG4gICAgc3R5bGUgPSBzaW5nbGV0b24gfHwgKHNpbmdsZXRvbiA9IGluc2VydFN0eWxlRWxlbWVudChvcHRpb25zKSk7XG4gICAgdXBkYXRlID0gYXBwbHlUb1NpbmdsZXRvblRhZy5iaW5kKG51bGwsIHN0eWxlLCBzdHlsZUluZGV4LCBmYWxzZSk7XG4gICAgcmVtb3ZlID0gYXBwbHlUb1NpbmdsZXRvblRhZy5iaW5kKG51bGwsIHN0eWxlLCBzdHlsZUluZGV4LCB0cnVlKTtcbiAgfSBlbHNlIHtcbiAgICBzdHlsZSA9IGluc2VydFN0eWxlRWxlbWVudChvcHRpb25zKTtcbiAgICB1cGRhdGUgPSBhcHBseVRvVGFnLmJpbmQobnVsbCwgc3R5bGUsIG9wdGlvbnMpO1xuXG4gICAgcmVtb3ZlID0gZnVuY3Rpb24gcmVtb3ZlKCkge1xuICAgICAgcmVtb3ZlU3R5bGVFbGVtZW50KHN0eWxlKTtcbiAgICB9O1xuICB9XG5cbiAgdXBkYXRlKG9iaik7XG4gIHJldHVybiBmdW5jdGlvbiB1cGRhdGVTdHlsZShuZXdPYmopIHtcbiAgICBpZiAobmV3T2JqKSB7XG4gICAgICBpZiAobmV3T2JqLmNzcyA9PT0gb2JqLmNzcyAmJiBuZXdPYmoubWVkaWEgPT09IG9iai5tZWRpYSAmJiBuZXdPYmouc291cmNlTWFwID09PSBvYmouc291cmNlTWFwKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgdXBkYXRlKG9iaiA9IG5ld09iaik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJlbW92ZSgpO1xuICAgIH1cbiAgfTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAobGlzdCwgb3B0aW9ucykge1xuICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTsgLy8gRm9yY2Ugc2luZ2xlLXRhZyBzb2x1dGlvbiBvbiBJRTYtOSwgd2hpY2ggaGFzIGEgaGFyZCBsaW1pdCBvbiB0aGUgIyBvZiA8c3R5bGU+XG4gIC8vIHRhZ3MgaXQgd2lsbCBhbGxvdyBvbiBhIHBhZ2VcblxuICBpZiAoIW9wdGlvbnMuc2luZ2xldG9uICYmIHR5cGVvZiBvcHRpb25zLnNpbmdsZXRvbiAhPT0gJ2Jvb2xlYW4nKSB7XG4gICAgb3B0aW9ucy5zaW5nbGV0b24gPSBpc09sZElFKCk7XG4gIH1cblxuICBsaXN0ID0gbGlzdCB8fCBbXTtcbiAgdmFyIGxhc3RJZGVudGlmaWVycyA9IG1vZHVsZXNUb0RvbShsaXN0LCBvcHRpb25zKTtcbiAgcmV0dXJuIGZ1bmN0aW9uIHVwZGF0ZShuZXdMaXN0KSB7XG4gICAgbmV3TGlzdCA9IG5ld0xpc3QgfHwgW107XG5cbiAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG5ld0xpc3QpICE9PSAnW29iamVjdCBBcnJheV0nKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsYXN0SWRlbnRpZmllcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBpZGVudGlmaWVyID0gbGFzdElkZW50aWZpZXJzW2ldO1xuICAgICAgdmFyIGluZGV4ID0gZ2V0SW5kZXhCeUlkZW50aWZpZXIoaWRlbnRpZmllcik7XG4gICAgICBzdHlsZXNJbkRvbVtpbmRleF0ucmVmZXJlbmNlcy0tO1xuICAgIH1cblxuICAgIHZhciBuZXdMYXN0SWRlbnRpZmllcnMgPSBtb2R1bGVzVG9Eb20obmV3TGlzdCwgb3B0aW9ucyk7XG5cbiAgICBmb3IgKHZhciBfaSA9IDA7IF9pIDwgbGFzdElkZW50aWZpZXJzLmxlbmd0aDsgX2krKykge1xuICAgICAgdmFyIF9pZGVudGlmaWVyID0gbGFzdElkZW50aWZpZXJzW19pXTtcblxuICAgICAgdmFyIF9pbmRleCA9IGdldEluZGV4QnlJZGVudGlmaWVyKF9pZGVudGlmaWVyKTtcblxuICAgICAgaWYgKHN0eWxlc0luRG9tW19pbmRleF0ucmVmZXJlbmNlcyA9PT0gMCkge1xuICAgICAgICBzdHlsZXNJbkRvbVtfaW5kZXhdLnVwZGF0ZXIoKTtcblxuICAgICAgICBzdHlsZXNJbkRvbS5zcGxpY2UoX2luZGV4LCAxKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBsYXN0SWRlbnRpZmllcnMgPSBuZXdMYXN0SWRlbnRpZmllcnM7XG4gIH07XG59OyIsImltcG9ydCAnLi8uLi8uLi9zY3NzL3Njc3Muc2Nzcyc7XHJcbmltcG9ydCBheGlvcyBmcm9tICdheGlvcyc7XHJcblxyXG5sZXQgZGlzbWlzcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5kaXNtaXNzT3JkZXJJY29uJyk7XHJcbmRpc21pc3MuZm9yRWFjaChkaXNtaXNzSWNvbiA9PiB7XHJcbiAgZGlzbWlzc0ljb24ub25jbGljayA9IGRpc21pc3NPcmRlcjtcclxufSk7XHJcblxyXG5mdW5jdGlvbiBkaXNtaXNzT3JkZXIoZXZlbnQpIHtcclxuICBsZXQgaWNvbiA9IGV2ZW50LmN1cnJlbnRUYXJnZXQ7XHJcbiAgbGV0IGlkID0gaWNvbi5kYXRhc2V0LmlkO1xyXG4gIGljb24uc3R5bGUuYW5pbWF0aW9uID0gXCJzaGFrZSAycyBpbmZpbml0ZVwiO1xyXG4gIGljb24uc3R5bGUuY29sb3IgPSBcInllbGxvd1wiO1xyXG4gIGF4aW9zLnBvc3QoJy9jYXJ0L2Rpc21pc3NvcmRlcicsIHtpZH0pLnRoZW4ocmVzID0+IHtcclxuICAgIGljb24uc3R5bGUuY29sb3IgPSBcIiM0QkI1NDNcIjtcclxuICAgIGljb24uc3R5bGUuYW5pbWF0aW9uID0gXCJub25lXCI7XHJcblxyXG4gICAgLy91cGRhdGUgdGhlIGNoYW5nZXMgaW4gdG90YWwgcXVhbnRpdHkgYW5kIHRvdGFsIHByaWNlXHJcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcudG90YWwtY291bnRlcicpLmlubmVyVGV4dCA9IHJlcy5kYXRhLnRvdGFsUXR5O1xyXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnRvdGFsLXByaWNlJykuaW5uZXJUZXh0ID0gcmVzLmRhdGEudG90YWxQcmljZTtcclxuXHJcbiAgICBzbGlkZUFuZEZhZGUoaWNvbi5wYXJlbnRFbGVtZW50KTtcclxuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICBpY29uLnN0eWxlLmNvbG9yID0gXCJvcmFuZ2VcIjtcclxuICAgIH0sIDMwMDApO1xyXG4gIH0pLmNhdGNoKCgpID0+IHtcclxuICAgIGljb24uc3R5bGUuY29sb3IgPSBcInJlZFwiO1xyXG4gICAgaWNvbi5zdHlsZS5hbmltYXRpb24gPSBcIm5vbmVcIjtcclxuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICBpY29uLnN0eWxlLmNvbG9yID0gXCJvcmFuZ2VcIjtcclxuICAgIH0sIDMwMDApO1xyXG4gIH0pO1xyXG59XHJcblxyXG5mdW5jdGlvbiBzbGlkZUFuZEZhZGUoZWxlbSkge1xyXG4gIGVsZW0uc3R5bGUudHJhbnNmb3JtID0gXCJ0cmFuc2xhdGVYKDMwMHB4KVwiO1xyXG4gIGVsZW0uc3R5bGUub3BhY2l0eSA9IFwiMFwiO1xyXG4gIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgZWxlbS5yZW1vdmUoKTtcclxuICB9LCAyMDAwKTtcclxufVxyXG4iLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHRpZihfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdKSB7XG5cdFx0cmV0dXJuIF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0uZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHRpZDogbW9kdWxlSWQsXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIi8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSAobW9kdWxlKSA9PiB7XG5cdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuXHRcdCgpID0+IG1vZHVsZVsnZGVmYXVsdCddIDpcblx0XHQoKSA9PiBtb2R1bGU7XG5cdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsIHsgYTogZ2V0dGVyIH0pO1xuXHRyZXR1cm4gZ2V0dGVyO1xufTsiLCIvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9ucyBmb3IgaGFybW9ueSBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSAoZXhwb3J0cywgZGVmaW5pdGlvbikgPT4ge1xuXHRmb3IodmFyIGtleSBpbiBkZWZpbml0aW9uKSB7XG5cdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGRlZmluaXRpb24sIGtleSkgJiYgIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBrZXkpKSB7XG5cdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywga2V5LCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZGVmaW5pdGlvbltrZXldIH0pO1xuXHRcdH1cblx0fVxufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSAob2JqLCBwcm9wKSA9PiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKSIsIi8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uciA9IChleHBvcnRzKSA9PiB7XG5cdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXHR9XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG59OyIsIi8vIHN0YXJ0dXBcbi8vIExvYWQgZW50cnkgbW9kdWxlXG5fX3dlYnBhY2tfcmVxdWlyZV9fKFwiLi9yZXNvdXJjZXMvanMvY3VzdG9tZXIvY2FydC5qc1wiKTtcbi8vIFRoaXMgZW50cnkgbW9kdWxlIHVzZWQgJ2V4cG9ydHMnIHNvIGl0IGNhbid0IGJlIGlubGluZWRcbiJdLCJzb3VyY2VSb290IjoiIn0=