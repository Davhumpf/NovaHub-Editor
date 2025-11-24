import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { Octokit } from "@octokit/rest";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.accessToken) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in with GitHub." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { owner, repo, path, content, message, branch, sha } = body;

    if (!owner || !repo || !path || !content || !message) {
      return NextResponse.json(
        {
          error: "Missing required fields: owner, repo, path, content, message",
        },
        { status: 400 }
      );
    }

    const octokit = new Octokit({
      auth: session.accessToken,
    });

    // Get the default branch if not specified
    let targetBranch = branch;
    if (!targetBranch) {
      const { data: repoData } = await octokit.repos.get({
        owner,
        repo,
      });
      targetBranch = repoData.default_branch;
    }

    // Create or update file
    const { data } = await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path,
      message,
      content: Buffer.from(content).toString("base64"),
      branch: targetBranch,
      ...(sha && { sha }), // Include SHA if updating existing file
    });

    return NextResponse.json({
      commit: {
        sha: data.commit.sha,
        url: data.commit.html_url,
        message: data.commit.message,
        author: data.commit.author,
        committer: data.commit.committer,
      },
      content: {
        name: data.content?.name,
        path: data.content?.path,
        sha: data.content?.sha,
        size: data.content?.size,
        url: data.content?.html_url,
      },
    });
  } catch (error: any) {
    console.error("Error creating/updating file:", error);

    if (error.status === 409) {
      return NextResponse.json(
        {
          error: "Conflict: The file has been modified. Please refresh and try again.",
          details: error.message,
        },
        { status: 409 }
      );
    }

    if (error.status === 404) {
      return NextResponse.json(
        { error: "Repository or file not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        error: "Failed to create/update file",
        details: error.message,
      },
      { status: error.status || 500 }
    );
  }
}

// GET method to retrieve the SHA of a file (needed for updates)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.accessToken) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in with GitHub." },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const owner = searchParams.get("owner");
    const repo = searchParams.get("repo");
    const path = searchParams.get("path");
    const ref = searchParams.get("ref");

    if (!owner || !repo || !path) {
      return NextResponse.json(
        { error: "Missing required parameters: owner, repo, and path" },
        { status: 400 }
      );
    }

    const octokit = new Octokit({
      auth: session.accessToken,
    });

    const { data } = await octokit.repos.getContent({
      owner,
      repo,
      path,
      ...(ref && { ref }),
    });

    if (Array.isArray(data) || data.type !== "file") {
      return NextResponse.json(
        { error: "The specified path is not a file" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      sha: data.sha,
      path: data.path,
      name: data.name,
    });
  } catch (error: any) {
    console.error("Error fetching file SHA:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch file information",
        details: error.message,
      },
      { status: error.status || 500 }
    );
  }
}
