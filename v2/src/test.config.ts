import { PossibleConfigs } from "./interface/config.interface";
const SIZE = 10000;

const sum = (
  left: PossibleConfigs,
  right: PossibleConfigs,
): PossibleConfigs => ({
  type: "sum",
  config: {},
  input: [left, right],
});

const multiply = (
  left: PossibleConfigs,
  right: PossibleConfigs,
): PossibleConfigs => ({
  type: "multiply",
  config: {},
  input: [left, right],
});

const fill = (value): PossibleConfigs => ({
  type: "fill",
  config: {
    rows: SIZE,
    columns: SIZE,
    value,
  },
});

export const basicConfig = sum(
  sum(
    multiply(
      fill(3),
      multiply(
        fill(4),
        sum(
          multiply(
            multiply(
              fill(4),
              sum(
                fill(2),
                fill(3),
              ),
            ),
            sum(
              sum(
                multiply(
                  fill(3),
                  multiply(
                    fill(4),
                    sum(
                      fill(2),
                      fill(3),
                    ),
                  ),
                ),
                fill(2),
              ),
              fill(3),
            ),
          ),
          multiply(
            fill(4),
            sum(
              fill(2),
              fill(3),
            ),
          ),
        ),
      ),
    ),
    fill(2),
  ),
  multiply(
    multiply(
      fill(4),
      sum(
        fill(2),
        fill(3),
      ),
    ),
    sum(
      sum(
        multiply(
          fill(3),
          multiply(
            fill(4),
            sum(
              fill(2),
              fill(3),
            ),
          ),
        ),
        fill(2),
      ),
      fill(3),
    ),
  ),
);
