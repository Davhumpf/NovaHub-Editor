import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { Octokit } from "@octokit/rest";
import { authOptions } from "../../auth/[...nextauth]/route";

/**
 * POST /api/github/rename
 * Renombra un archivo en GitHub (lo copia al nuevo nombre y elimina el antiguo)
 */
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
    const { owner, repo, oldPath, newPath, message, sha, branch } = body;

    if (!owner || !repo || !oldPath || !newPath || !message || !sha) {
      return NextResponse.json(
        {
          error: "Missing required fields: owner, repo, oldPath, newPath, message, sha",
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

    // Step 1: Get the content of the old file
    const { data: oldFile } = await octokit.repos.getContent({
      owner,
      repo,
      path: oldPath,
      ref: targetBranch,
    });

    if (Array.isArray(oldFile) || oldFile.type !== "file") {
      return NextResponse.json(
        { error: "The specified path is not a file" },
        { status: 400 }
      );
    }

    // Step 2: Create the new file with the same content
    const { data: newFile } = await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path: newPath,
      message: `${message} (rename from ${oldPath})`,
      content: oldFile.content,
      branch: targetBranch,
    });

    // Step 3: Delete the old file
    await octokit.repos.deleteFile({
      owner,
      repo,
      path: oldPath,
      message: `${message} (remove old file)`,
      sha: sha,
      branch: targetBranch,
    });

    return NextResponse.json({
      success: true,
      newFile: {
        name: newFile.content?.name,
        path: newFile.content?.path,
        sha: newFile.content?.sha,
        size: newFile.content?.size,
        url: newFile.content?.html_url,
      },
      commit: {
        sha: newFile.commit.sha,
        url: newFile.commit.html_url,
        message: newFile.commit.message,
      },
    });
  } catch (error: any) {
    console.error("Error renaming file:", error);

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

    if (error.status === 422) {
      return NextResponse.json(
        {
          error: "Validation failed: File already exists at new path",
          details: error.message,
        },
        { status: 422 }
      );
    }

    return NextResponse.json(
      {
        error: "Failed to rename file",
        details: error.message,
      },
      { status: error.status || 500 }
    );
  }
}
