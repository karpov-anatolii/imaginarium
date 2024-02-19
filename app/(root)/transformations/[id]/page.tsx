import React from "react";

const TransformationPage = ({ params }: { params: { id: string } }) => {
  const id = params.id;
  return <div>TransformationIdPage {id}</div>;
};

export default TransformationPage;
