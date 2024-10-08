import QuestionCard from "@/components/cards/QuestionCard";
import NoResult from "@/components/shared/NoResult";
import LocalSearchBar from "@/components/shared/search/LocalSearchbar";
import { getQuestionByTagId } from "@/lib/actions/tag.action";
import { IQuestion } from "@/lib/database/question.model";
import { URLProps } from "@/types";
import React from "react";

const Tags = async ({ params, searchParams }: URLProps) => {
  const result = await getQuestionByTagId({
    tagId: params.id,
    page: 1,
    searchQuery: searchParams.q,
  });
  return (
    <>
      <h1 className="h1-bold text-dark100_light900">{result.tagTitle}</h1>

      <div className="mt-11 w-full">
        <LocalSearchBar
          route="/"
          iconPosition="left"
          imgSrc="/assets/icons/search.svg"
          placeholder="Search tag questions"
          otherClasses="flex-1"
        />
      </div>

      <div className="mt-10 flex w-full flex-col gap-6">
        {result.questions.length > 0 ? (
          result.questions.map((question: IQuestion) => (
            <QuestionCard
              key={question._id}
              _id={question._id}
              title={question.title}
              tags={question.tags}
              author={question.author}
              upvotes={question.upvotes}
              views={question.views}
              answers={question.answers}
              createdAt={question.createdAt}
            />
          ))
        ) : (
          <NoResult
            title="There's no tag question to show"
            description="Lorem ipsum dolor sit amet consectetur adipisicing elit. Ratione culpa
      reprehenderit eum nam possimus repellat temporibus, incidunt modi
      dignissimos commodi fugit dolorem dolorum nemo aliquid distinctio
      provident natus debitis blanditiis."
            link="/ask-question"
            linkTitle="Ask a Question"
          />
        )}
      </div>
    </>
  );
};

export default Tags;
