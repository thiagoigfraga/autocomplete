const commonOptions: Fig.Option[] = [
  {
    name: ["--config-path", "-c"],
    description: "Specify the path to the configuration file",
    isPersistent: true,
  },
  {
    name: ["--sake-app-path", "-s"],
    description: "Specify the path for the SakeApp package",
    isPersistent: true,
  },
];
const commonCommandSpecificOptions: Fig.Option[] = [
  {
    name: "--case-converting-strategy",
    description: "Specify the strategy for converting command names' case",
    args: {
      name: "strategy",
      default: "keepOriginal",
      suggestions: ["keepOriginal", "toSnakeCase", "toKebabCase"],
    },
    priority: 55,
  },
];

const completionSpec: Fig.Spec = {
  name: "sake",
  description:
    "🍶 Swift-based utility for managing command execution with dependencies and conditions, inspired by Make",
  generateSpec: async (_tokens, executeShellCommand) => {
    const { stdout } = await executeShellCommand({
      command: "sake",
      args: ["list", "--json"],
    });
    const commands = JSON.parse(stdout);
    const subcommands = Object.keys(commands.groups).reduce(
      (acc, groupName) => {
        const group = commands.groups[groupName];
        return [
          ...acc,
          ...group.map((command) => {
            return {
              name: command.name,
              description: command.description || "The command to run",
              priority: 76,
              icon: "🍶",
              options: [...commonOptions, ...commonCommandSpecificOptions],
            };
          }),
        ];
      },
      []
    );
    return {
      name: "sake",
      subcommands,
    };
  },
  subcommands: [
    {
      name: "init",
      description:
        "Initialize a new SakeApp project template for defining commands",
      options: [...commonOptions],
    },
    {
      name: "clean",
      description:
        "Remove all build artifacts generated by the SakeApp to ensure a clean state for future builds",
      options: [...commonOptions],
    },
    {
      name: "list",
      description: "List all available commands defined in the SakeApp",
      options: [
        ...commonOptions,
        ...commonCommandSpecificOptions,
        {
          name: ["--json", "-j"],
          description: "Output the list of commands in JSON format",
          priority: 45,
        },
      ],
    },
    {
      name: "run",
      description: "Run the specified command from the SakeApp",
      args: {
        name: "command",
        description: "The command to run",
        generators: {
          script: ["sake", "list", "--json"],
          postProcess: (output) => {
            const commands = JSON.parse(output);
            return Object.keys(commands.groups).reduce((acc, groupName) => {
              const group = commands.groups[groupName];
              return [
                ...acc,
                ...group.map((command) => {
                  return {
                    name: command.name,
                    description: command.description,
                    priority: 76,
                    icon: "🍶",
                  };
                }),
              ];
            }, []);
          },
        },
      },
      options: [...commonOptions, ...commonCommandSpecificOptions],
    },
  ],
  options: [
    {
      name: ["--help", "-h"],
      description: "Show help information",
      isPersistent: true,
      priority: 40,
    },
  ],
};
export default completionSpec;