import Profile from "@/components/forms/Profile";
import { getUserById } from "@/lib/actions/user.action";
import { ParamsProps } from "@/types";
import { auth } from "@clerk/nextjs/server";
import React from "react";

const Edit = async ({ params }: ParamsProps) => {
  const { userId } = await auth();
  if (!userId) return null;
  const mongoUser = await getUserById({ userId });
//   const result = await getQuestionById({ questionId: params.id });
  return (
    <>
      <h1 className="h1-bold text-dark100_light900">Edit Profile</h1>
      <div className="mt-9">
        <Profile
          clerkId={userId}
          user={JSON.stringify(mongoUser)}
        />
      </div>
    </>
  );
};

export default Edit;
