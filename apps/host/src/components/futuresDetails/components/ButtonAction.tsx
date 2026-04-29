import Text from "@/components/common/Text";
import React from "react";

const ButtonAction = ({
  action,
  title,
}: {
  title: string;
  action: () => void;
}) => {
  return (
    <div
      className="px-[8px] py-[6px] bg-[#ECECED14] rounded-[4px] cursor-pointer"
      onClick={action}
    >
      <Text text={title} className="!font-[330]" fontSize={11} />
    </div>
  );
};

export default ButtonAction;
