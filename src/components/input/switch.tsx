"use client"

import { useState } from "react";
import {
  InputSwitch,
  InputSwitchChangeEvent,
  InputSwitchProps,
} from "primereact/inputswitch";

interface ISwitch extends InputSwitchProps {}

// export function Switch({ ...rest }: ISwitch) {
export function Switch() {
  const [checked, setChecked] = useState<boolean>(false);

  return (
    <div className="card flex justify-content-center">
      <InputSwitch
        // {...rest}
        checked={checked}
        onChange={(e: InputSwitchChangeEvent) => setChecked(e.value)}
      />
    </div>
  );
}
