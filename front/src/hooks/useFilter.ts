// Bismillaahirrahmaanirrahiim

import { useEffect, useState } from 'react';

export function useFilter<T, U>(filterMapArr: readonly U[]) {
  const [checked, setChecked] = useState<T>(
    filterMapArr.reduce(
      (prev, curr) => ({
        ...prev,
        [curr as any]: true,
      }),
      {} as T
    )
  );

  const [checkedArr, setCheckedArr] = useState<U[]>([]);

  useEffect(() => {
    setCheckedArr(
      (Object.keys(checked) as any as U[]).reduce(
        (prev, chain) => ((checked as any)[chain] ? [...prev, chain] : prev),
        [] as U[]
      )
    );
  }, [checked]);

  return [checked, setChecked, checkedArr] as const;
}
