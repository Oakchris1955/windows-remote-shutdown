import { Request, Response } from "express";
import { readFile } from "fs/promises";
import { exec } from "child_process";

enum ActionType {
	Shutdown = "shutdown",
	Reboot = "reboot"
}

const defaultTimeout = 0;
const defaultForceful = true;

function actionFlag(action: ActionType): string {
	switch (action) {
		case ActionType.Shutdown:
			return "-s";
		case ActionType.Reboot:
			return "-r";
		default:
			throw new Error("Couldn't find specified method type.");
	}
}

function action(method: ActionType, timeout: number, forceful: boolean) {
	exec(`shutdown ${actionFlag(method)} ${forceful ? "-f" : ""} -t ${timeout}`);
}

export async function handler(req: Request, res: Response) {
	// slice(1) removes the trailing "/" in the beginning of the string
	const method = req.path.slice(1) as ActionType;
	const timeout = +(req.body.timeout as string) || +(req.query.timeout as string) || defaultTimeout
	const forceful = (req.body.forceful as string || req.query.forceful as string || defaultForceful.toString()) === "true";

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
			action(method, timeout, forceful)
		} else {
			// Else, send 403 Forbidden
			res.status(403).end()
		}
	}
}
