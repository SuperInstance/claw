// Stub file for command formatting
// TODO: Implement actual command formatting

export interface CliCommand {
  name: string;
  args: string[];
}

export function formatCliCommand(command: string, args: string[] = []): string {
  return [command, ...args].join(" ");
}

export function formatClicommand(command: CliCommand): string {
  return formatCliCommand(command.name, command.args);
}
