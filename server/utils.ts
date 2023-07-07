import { Request, Response } from "express";
import { readFile } from "fs/promises";
import { exec } from "child_process";

enum ActionType {
	Shutdown = "shutdown",
	Reboot = "reboot"
}

function action(method: ActionType) {
	switch (method) {
		case ActionType.Shutdown:
			exec("shutdown -s -t 0");
			break;
		case ActionType.Reboot:
			exec("shutdown -r -t 0");
			break;
		default:
			throw new Error("Couldn't find specified method type.");
	}
}

export async function handler(req: Request, res: Response) {
	// slice(1) removes the trailing "/" in the beginning of the string
	const method = req.path.slice(1) as ActionType;

	console.log(req.body);

	// If no authorization token detected, send 401 Unathorized
	if (typeof req.body.auth_token !== "string") {
		res.status(401).end();
		return;
	} else {
		const user_auth_token = req.body.auth_token;

		const stored_auth_token = (await readFile("AUTH_TOKEN")).toString();

		if (stored_auth_token == user_auth_token) {
			// If authorization token is valid, send 202 Accepted
			res.status(202).end()
			action(method)
		} else {
			// Else, send 403 Forbidden
			res.status(403).end()
		}
	}
}
