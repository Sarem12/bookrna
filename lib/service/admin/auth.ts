"use server";

import { prisma } from "@/lib/prisma";
import { Gender } from "@prisma/client";
import { getTagsFromAI } from "@/lib/gemini";

export async function loginAction(username: string, password: string) {
  try {
    const user = await prisma.user.findFirst({
      where: {
        username,
        password
      },
      select: { id: true }
    });

    if (!user) {
      return { error: "Invalid username or password" };
    }

    return { success: true, userId: user.id };
  } catch (e) {
    return { error: "Database connection failed" };
  }
}

export async function generateSignupTagsAction(userBio: string) {
  try {
    const bio = userBio.trim();
    if (bio.length < 10) {
      return { error: "Tell us a bit more before generating tags." };
    }

    const existingTagNames = (
      await prisma.tag.findMany({
        select: { name: true }
      })
    ).map((tag) => tag.name);

    const aiTags = (await getTagsFromAI(bio, existingTagNames)) as string[];
    const tags = Array.from(new Set(aiTags.map((tag) => tag.trim()).filter(Boolean))).slice(0, 8);

    return { success: true, tags };
  } catch (e) {
    console.error(e);
    return { error: "Unable to generate tags right now." };
  }
}

export async function signupAction(payload: {
  first: string;
  last: string;
  username: string;
  email: string;
  password: string;
  age: number;
  gender: Gender;
  bio: string;
  selectedTags?: string[];
}) {
  try {
    const first = payload.first.trim();
    const last = payload.last.trim();
    const username = payload.username.trim();
    const email = payload.email.trim().toLowerCase();
    const password = payload.password;
    const age = Number(payload.age);
    const bio = payload.bio.trim();

    if (!first || !last || !username || !email || !password || !bio) {
      return { error: "Missing required signup fields." };
    }

    if (!Number.isFinite(age) || age < 1) {
      return { error: "Invalid age." };
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ username }, { email }]
      },
      select: { id: true, username: true, email: true }
    });

    if (existingUser?.username === username) {
      return { error: "Username already exists." };
    }

    if (existingUser?.email === email) {
      return { error: "Email already exists." };
    }

    const existingTagNames = (
      await prisma.tag.findMany({
        select: { name: true }
      })
    ).map((tag) => tag.name);

    const aiTags = (await getTagsFromAI(bio, existingTagNames)) as string[];
    const requestedTags = (payload.selectedTags ?? []).map((tag) => tag.trim()).filter(Boolean);
    const uniqueTags = Array.from(new Set([...aiTags, ...requestedTags])).slice(0, 8);

    const createdUser = await prisma.user.create({
      data: {
        first,
        last,
        username,
        email,
        password,
        age,
        gender: payload.gender,
        userspecificAPI: [],
        UISettings: {
          bio
        }
      }
    });

    for (const tagName of uniqueTags) {
      const tag = await prisma.tag.upsert({
        where: { name: tagName },
        update: {},
        create: {
          name: tagName,
          linkedWith: []
        }
      });

      await prisma.userTag.create({
        data: {
          UserId: createdUser.id,
          TagId: tag.id,
          likingLevel: 0
        }
      });
    }

    return {
      success: true,
      userId: createdUser.id,
      tags: uniqueTags
    };
  } catch (e) {
    console.error(e);
    return { error: "Unable to create account right now." };
  }
}

export async function checkAuthAction(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return { authenticated: false };
    }

    return { authenticated: true, userId: user.id };
  } catch (e) {
    return { authenticated: false };
  }
}
