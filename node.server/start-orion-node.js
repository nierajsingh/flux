/*******************************************************************************
 * @license
 * Copyright (c) 2013, 2014 Pivotal Software, Inc. and others.
 * All rights reserved. This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License v1.0
 * (http://www.eclipse.org/legal/epl-v10.html), and the Eclipse Distribution
 * License v1.0 (http://www.eclipse.org/org/documents/edl-v10.html).
 *
 * Contributors:
 *     Pivotal Software, Inc. - initial API and implementation
*******************************************************************************/

/*global require console module exports __dirname*/
// exports a function to create and start orion-node instance on some port
module.exports = function (options) {

	var port = options.port || 3001;
	var fluxPlugin = options.fluxPlugin;

	var pathResolve = require('path').resolve;
	// TODO: should use require('orion') and declare dependency via package.json
	//   but for now we need to use Alex's clone of orion.client.
	var createOrion = require('../../orion.client/modules/orionode');
	var fsStat= require('fs').statSync;
	var fsMkdir= require('fs').mkdirSync;
	var express = require('express');

	console.log("Orion module loaded: ", createOrion);

	var workspaceDir = pathResolve(__dirname, ".workspace");

	//make sure the workspaceDir exists.
	function isDir(p) {
		try {
			return fsStat(p).isDirectory();
		} catch (e) {
			return false;
		}
	}

	if (!isDir(workspaceDir)) {
		fsMkdir(workspaceDir);
	}

	// set up all parameters for startServer
	var params = {
		port: port,
		workspaceDir: workspaceDir,
		passwordFile: null,
		password: null,
		configParams: {},
		dev: null,
		log: null
	};

	var orion = createOrion(params);

	var app = express();
	app.use(app.router); //our router first so we can override stuff from orion-node

	if (fluxPlugin) {
		var defaultPlugins = {
				//Copied from defaults.pref in orion-node
				"/plugins":{
					"plugins/fileClientPlugin.html":true,
					"plugins/jslintPlugin.html":true,
					"edit/content/imageViewerPlugin.html":true,
					"edit/content/jsonEditorPlugin.html":true,
					"plugins/webEditingPlugin.html":true,
					"plugins/languages/arduino/arduinoPlugin.html":true,
					"plugins/languages/c/cPlugin.html":true,
					"plugins/languages/cpp/cppPlugin.html":true,
					"plugins/languages/java/javaPlugin.html":true,
					"plugins/languages/lua/luaPlugin.html":true,
					"plugins/languages/php/phpPlugin.html":true,
					"plugins/languages/python/pythonPlugin.html":true,
					"plugins/languages/ruby/rubyPlugin.html":true,
					"plugins/languages/xml/xmlPlugin.html":true,
					"plugins/languages/xquery/xqueryPlugin.html":true,
					"plugins/languages/yaml/yamlPlugin.html":true,
					"plugins/pageLinksPlugin.html":true,
					"webtools/plugins/webToolsPlugin.html":true,
					"javascript/plugins/javascriptPlugin.html":true,
					"shell/plugins/shellPagePlugin.html":true,
					"plugins/nodePlugin.html":true,
					"search/plugins/searchPagePlugin.html":true
				},
				"/settingsContainer":{
					"categories":{
						"showUserSettings":false,
						"showGitSettings":false
					}
				}
		};
		defaultPlugins["/plugins"][fluxPlugin] = true;
		defaultPlugins = JSON.stringify(defaultPlugins, null, "   ");

		app.get("/defaults.pref", function (req, res) {
			res.send(defaultPlugins);
		});
	}

	app.use(orion);
	app.listen(params.port);
};
