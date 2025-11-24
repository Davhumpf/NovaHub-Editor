import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { Octokit } from "@octokit/rest";
import { authOptions } from "../../auth/[...nextauth]/route";

/**
 * DELETE /api/github/delete
 * Elimina un archivo de un repositorio de GitHub
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.accessToken) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in with GitHub." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { owner, repo, path, message, sha, branch } = body;

    if (!owner || !repo || !path || !message || !sha) {
      return NextResponse.json(
        {
          error: "Missing required fields: owner, repo, path, message, sha",
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

    // Delete the file
    const { data } = await octokit.repos.deleteFile({
      owner,
      repo,
      path,
      message,
      sha,
      branch: targetBranch,
    });

    return NextResponse.json({
      success: true,
      commit: {
        sha: data.commit.sha,
        url: data.commit.html_url,
        message: data.commit.message,
        author: data.commit.author,
        committer: data.commit.committer,
      },
    });
  } catch (error: any) {
    console.error("Error deleting file:", error);

    if (error.status === 404) {
      return NextResponse.json(
        { error: "Repository or file not found" },
        { status: 404 }
      );
    }

    if (error.status === 409) {
      return NextResponse.json(
        {
          error: "Conflict: The file has been modified. Please refresh and try again.",
          details: error.message,
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        error: "Failed to delete file",
        details: error.message,
      },
      { status: error.status || 500 }
    );
  }
}
