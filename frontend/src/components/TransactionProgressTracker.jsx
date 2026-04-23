useEffect(() => {
  const provider = contract?.runner?.provider;
  if (!provider || typeof provider.on !== "function" || !activeLandId) return;

  let timeoutId = null;

  const handleBlock = () => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      loadProgress(false);
    }, 300);
  };

  provider.on("block", handleBlock);

  return () => {
    clearTimeout(timeoutId);
    if (typeof provider.off === "function") {
      provider.off("block", handleBlock);
    }
  };
}, [contract, activeLandId]);