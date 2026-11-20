import "react-day-picker";

declare module "react-day-picker" {
  interface PropsBase {
    /** Compatibility with shadcn @plate/date-node targeting DayPicker v8 prop name */
    initialFocus?: boolean;
  }
}
