import { Question } from '../../types/ftiTypes';

export const formatQuestion = (data: Question[]): string[] => {
  return data.map((item) => item.fti_question);
};

export const formatQuestionImage = (data: Question[]): string[] => {
  return data.map((item) => item.fti_question_image);
};
