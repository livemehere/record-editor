import { useEffect, useState } from "react";

const useCacheVideoFiles = () => {
  const [files, setFiles] = useState<any[]>([]);
  const fetchCacheVideoList = () => {
    // @ts-ignore
    window.app.invoke("video:list", "cache").then((list: any) => {
      /* 최신순 정렬 */
      const sortedList = list.sort((a: any, b: any) => {
        const aBirthTime = a.meta.birthtimeMs;
        const bBirthTime = b.meta.birthtimeMs;
        return bBirthTime - aBirthTime;
      });
      setFiles(sortedList);
    });
  };

  useEffect(() => {
    fetchCacheVideoList();
  }, []);

  return {
    files,
    refetch: fetchCacheVideoList,
  };
};

export default useCacheVideoFiles;
