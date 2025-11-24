import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { Octokit } from "@octokit/rest";
import { authOptions } from "../../auth/[...nextauth]/route";

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
    const ref = searchParams.get("ref"); // branch, tag, or commit SHA

    if (!owner || !repo || !path) {
      return NextResponse.json(
        { error: "Missing required parameters: owner, repo, and path" },
        { status: 400 }
      );
    }

    const octokit = new Octokit({
      auth: session.accessToken,
    });

    // Get file content
    const { data } = await octokit.repos.getContent({
      owner,
      repo,
      path,
      ...(ref && { ref }),
    });

    // Check if it's a file (not a directory)
    if (Array.isArray(data) || data.type !== "file") {
      return NextResponse.json(
        { error: "The specified path is not a file" },
        { status: 400 }
      );
    }

    // Decode content from base64
    const content = Buffer.from(data.content, "base64").toString("utf-8");

    return NextResponse.json({
      name: data.name,
      path: data.path,
      sha: data.sha,
      size: data.size,
      content,
      encoding: data.encoding,
      url: data.html_url,
      download_url: data.download_url,
    });
  } catch (error: any) {
    console.error("Error fetching file content:", error);

    if (error.status === 404) {
      return NextResponse.json(
        { error: "File not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        error: "Failed to fetch file content",
        details: error.message,
      },
      { status: error.status || 500 }
    );
  }
}
