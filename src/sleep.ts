export type SleepInput = {
  /** Number of milliseconds to pause program execution for. */
  readonly ms: number;
};

export default async function sleep({ ms }: SleepInput): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}
