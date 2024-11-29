"use server";

import Answer from "../database/answer.model";
import Question from "../database/question.model";
import Tag from "../database/tag.model";
import User from "../database/user.model";
import { connectToDatabase } from "../mongoose";
import { SearchParams } from "./shared.types";

const searchableTypes = ["question", "answer", "user", "tag"];

export const globalSearch = async (params: SearchParams) => {
  try {
    await connectToDatabase();
    const { type, query } = params;
    const regexQuery = { $regex: query, $options: "i" };
    let results = [];
    const modelsAndTypes = [
      { model: Question, searchField: "title", type: "question" },
      { model: User, searchField: "name", type: "user" },
      { model: Answer, searchField: "content", type: "answer" },
      { model: Tag, searchField: "name", type: "tag" },
    ];
    const typeLowerCase = type?.toLowerCase();
    if (!typeLowerCase || !searchableTypes.includes(typeLowerCase)) {
      for (const { model, searchField, type } of modelsAndTypes) {
        const queryResults = await model
          .find({ [searchField]: regexQuery })
          .limit(2);
        results.push(
          ...queryResults.map((item) => ({
            title:
              type === "answer"
                ? "Answers containing " + query
                : item[searchField],
            type,
            id:
              type === "user"
                ? item.clerkId
                : type === "answer"
                  ? item.question
                  : item._id,
          }))
        );
      }
    } else {
      const modelInfo = modelsAndTypes.find(
        (item) => item.type === typeLowerCase
      );
      if (!modelInfo) {
        throw new Error("Invalid type");
      }
      const queryResults = await modelInfo.model
        .find({ [modelInfo.searchField]: regexQuery })
        .limit(8);
      results = queryResults.map((item) => ({
        title:
          type === "answer"
            ? "Answers containing " + query
            : item[modelInfo.searchField],
        type,
        id:
          type === "user"
            ? item.clerkId
            : type === "answer"
              ? item.question
              : item._id,
      }));
    }
    return JSON.stringify(results);
  } catch (error) {
    console.log("Error fetching global results", error);
    throw error;
  }
};
