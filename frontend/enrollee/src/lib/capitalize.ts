const capitalizeWords = (str: string | null | undefined) => {
  if (!str) return "";
  return str
    .toLowerCase()
    .split(" ")
    .map((word) => {
      if (word.length === 0) return "";
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
};

export default capitalizeWords;
