export const formatZodErrors = (issues, initialErrors) => {
   const formattedErrors = structuredClone(initialErrors);

   issues.forEach((issue) => {
      const field = issue.path[0];

      if (formattedErrors[field] && formattedErrors[field].length === 0) {
         formattedErrors[field].push(issue.message);
      }
   });

   return formattedErrors;
};
