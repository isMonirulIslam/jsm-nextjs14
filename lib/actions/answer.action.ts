"use server";

import { revalidatePath } from "next/cache";
import Question from "../database/question.model";
import { connectToDatabase } from "../mongoose";
import {
  AnswerVoteParams,
  CreateAnswerParams,
  GetAnswersParams,
} from "./shared.types";
import Answer from "../database/answer.model";
import { Inter } from "next/font/google";
import Interaction from "../database/interaction.model";
import User from "../database/user.model";

export const createAnswer = async (params: CreateAnswerParams) => {
  try {
    connectToDatabase();

    const { content, author, question, path } = params;
    // Create the questions
    const answer = await Answer.create({
      content,
      author,
      question,
    });

    const questionObject = await Question.findByIdAndUpdate(question, {
      $push: { answers: answer._id },
    });
    // TODO: Add Interaction..
    await Interaction.create({
      user: author,
      type: "answer",
      question,
      answer: answer._id,
      tags: questionObject.tags,
    });
    await User.findByIdAndUpdate(author, { $inc: { reputation: 10 } });

    revalidatePath(path);
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const getAnswers = async (params: GetAnswersParams) => {
  try {
    connectToDatabase();
    const { questionId, sortBy, page = 1, pageSize = 5 } = params;

    const skipAmount = (page - 1) * pageSize;

    let sortOptions = {};

    switch (sortBy) {
      case "highestUpvotes":
        sortOptions = { upvotes: -1 };
        break;
      case "lowestUpvotes":
        sortOptions = { upvotes: 1 };
        break;
      case "recent":
        sortOptions = { createdAt: -1 };
        break;
      case "old":
        sortOptions = { createdAt: 1 };
        break;

      default:
        break;
    }

    const answers = await Answer.find({ questionId })
      .populate("author", "_id clerkId name picture")
      .sort(sortOptions)
      .skip(skipAmount)
      .limit(pageSize);
    const totalAnswers = await Answer.countDocuments({ questionId });
    const isNextAnswers = totalAnswers > skipAmount + answers.length;
    return { answers, isNextAnswers };
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export async function upvoteAnswer(params: AnswerVoteParams) {
  try {
    connectToDatabase();

    const { answerId, userId, hasUpvoted, hasDownvoted, path } = params;

    let updateQuery = {};

    if (hasUpvoted) {
      updateQuery = { $pull: { upvotes: userId } };
    } else if (hasDownvoted) {
      updateQuery = {
        $pull: { downvotes: userId },
        $push: { upvotes: userId },
      };
    } else {
      updateQuery = { $addToSet: { upvotes: userId } };
    }

    const answer = await Answer.findByIdAndUpdate(answerId, updateQuery, {
      new: true,
    });

    if (!answer) {
      throw new Error("Answer not found");
    }

    // Increment author's reputation
    await User.findByIdAndUpdate(userId, {
      $inc: { reputation: hasUpvoted ? -2 : 2 },
    });

    // Author Reputation
    await User.findByIdAndUpdate(answer.author, {
      $inc: { reputation: hasUpvoted ? -10 : 10 },
    });

    revalidatePath(path);
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function downvoteAnswer(params: AnswerVoteParams) {
  try {
    connectToDatabase();

    const { answerId, userId, hasUpvoted, hasDownvoted, path } = params;

    let updateQuery = {};

    if (hasDownvoted) {
      updateQuery = { $pull: { downvote: userId } };
    } else if (hasUpvoted) {
      updateQuery = {
        $pull: { upvotes: userId },
        $push: { downvotes: userId },
      };
    } else {
      updateQuery = { $addToSet: { downvotes: userId } };
    }

    const answer = await Answer.findByIdAndUpdate(answerId, updateQuery, {
      new: true,
    });

    if (!answer) {
      throw new Error("Answer not found");
    }

    // Increment author's reputation
    // Increment author's reputation
    await User.findByIdAndUpdate(userId, {
      $inc: { reputation: hasDownvoted ? -2 : 2 },
    });

    // Author Reputation
    await User.findByIdAndUpdate(answer.author, {
      $inc: { reputation: hasDownvoted ? -10 : 10 },
    });

    revalidatePath(path);
  } catch (error) {
    console.log(error);
    throw error;
  }
}
