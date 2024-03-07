import { useEffect, useState } from "react";

const useAppSetting = (key: string) => {
  const [_val, _setVal] = useState<any>();

  useEffect(() => {
    window.app.invoke("appSetting:get", key).then((value: any) => {
      _setVal(value);
    });
  }, []);

  const setValue = async (newValue: any) => {
    await window.app.invoke("appSetting:set", key, newValue);
    await window.app.invoke("appSetting:get", key).then((val: any) => {
      _setVal(val);
    });
  };

  return {
    value: _val,
    setValue,
  };
};

export default useAppSetting;
{
}
