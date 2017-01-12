
export class AsyDropdownHandlers {
	public static handlers: any = {};

	public static registerHandler(mode: string, id: string, handler: any) {
		AsyDropdownHandlers.handlers[mode] = AsyDropdownHandlers.handlers[mode] || [];
		AsyDropdownHandlers.handlers[mode].push({
			id: id,
			handler: handler
		});
	}
}
