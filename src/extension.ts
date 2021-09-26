import {
	ExtensionContext,
	window,
	commands,
	env
} from 'vscode';
import axios from 'axios';

import { VersionsDto } from './dto/versions.dto';
import { PackagesDto } from './dto/packages.dto';

const getPackageUrl = (packageName: string, packageVersion: string) =>
	`https://deno.land/x/${packageName}@${packageVersion}/mod.ts`;

const getPackageFinderUrl = (packageName: string) => 
	`https://api.deno.land/modules?page=1&limit=3&query=${packageName}`;

const getVersionFinderUrl = (packageName: string) => 
	`https://cdn.deno.land/${packageName}/meta/versions.json`;

const print = window.showInformationMessage;

export const activate = (context: ExtensionContext) => {
	let disposable = commands.registerCommand(
		'deno-package-finder.findDenoPackage',
		async () => {
			// get user's package search query
			const searchName = await window.showInputBox();
			if (!searchName) { return; } // exit on no input
			
			// get package data from deno.land api
			const { data: packageSearch } = await axios.get<PackagesDto>(
				getPackageFinderUrl(searchName)
			);

			// handle error fetcing package data
			if (!packageSearch.success) {
				print('Something went wrong while searching for you pacakge...');
				return; // exit on error
			}

			// get name of package to use
			let name: string | undefined;
			const exactMatch = packageSearch.data.results.find(r => r.name === searchName);
			if (exactMatch) {
				// set name to the name of a package matches the query exactly
				name = exactMatch.name;
			} else {
				// set name to the what the user selects
				const res = await window.showQuickPick(
					packageSearch.data.results.map(
						r => `${r.name}: ${r.description}`
					)
				);
				if (!res) {
					return; // exit on no input
				} else if (res.indexOf(':') !== -1) {
					name = res.substr(0, res.indexOf(':'));
				}
			}

			// exit if name is null or empty
			if (!name) { return; } 

			// get version options from deno.land api
			const { data: versionSearch } = await axios.get<VersionsDto>(
				getVersionFinderUrl(name)
			);

			// get user input for which version to use
			const version = await window.showQuickPick(versionSearch.versions);

			// exit on no input
			if (!version) { return; }
			
			// copy url to clipboard
			const finalUrl = getPackageUrl(name, version);
			await env.clipboard.writeText(finalUrl);
			print(`Url Copied: ${finalUrl}`);
		}
	);

	context.subscriptions.push(disposable);
};

// this method is called when your extension is deactivated
export const deactivate = () => { };
