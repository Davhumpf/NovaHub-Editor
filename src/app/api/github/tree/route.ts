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
    const branch = searchParams.get("branch") || "main";

    if (!owner || !repo) {
      return NextResponse.json(
        { error: "Missing required parameters: owner and repo" },
        { status: 400 }
      );
    }

    const octokit = new Octokit({
      auth: session.accessToken,
    });

    // Get the default branch if not specified
    let targetBranch = branch;
    if (branch === "main") {
      try {
        const { data: repoData } = await octokit.repos.get({
          owner,
          repo,
        });
        targetBranch = repoData.default_branch;
      } catch (error) {
        // If we can't get repo data, try with 'main' first
        targetBranch = "main";
      }
    }

    // Get the tree recursively
    try {
      const { data: refData } = await octokit.git.getRef({
        owner,
        repo,
        ref: `heads/${targetBranch}`,
      });

      const commitSha = refData.object.sha;

      const { data: commitData } = await octokit.git.getCommit({
        owner,
        repo,
        commit_sha: commitSha,
      });

      const treeSha = commitData.tree.sha;

      // Get the tree recursively
      const { data: treeData } = await octokit.git.getTree({
        owner,
        repo,
        tree_sha: treeSha,
        recursive: "true",
      });

      // Transform the tree into a more usable format
      const files = treeData.tree
        .filter((item) => item.type === "blob") // Only files, not trees
        .map((item) => ({
          path: item.path,
          sha: item.sha,
          size: item.size,
          type: item.type,
          url: item.url,
        }));

      const folders = treeData.tree
        .filter((item) => item.type === "tree")
        .map((item) => ({
          path: item.path,
          sha: item.sha,
          type: item.type,
        }));

      return NextResponse.json({
        branch: targetBranch,
        sha: treeSha,
        files,
        folders,
        truncated: treeData.truncated,
      });
    } catch (error: any) {
      // If main branch doesn't exist, try master
      if (branch === "main" && error.status === 404) {
        try {
          const { data: refData } = await octokit.git.getRef({
            owner,
            repo,
            ref: "heads/master",
          });

          const commitSha = refData.object.sha;

          const { data: commitData } = await octokit.git.getCommit({
            owner,
            repo,
            commit_sha: commitSha,
          });

          const treeSha = commitData.tree.sha;

          const { data: treeData } = await octokit.git.getTree({
            owner,
            repo,
            tree_sha: treeSha,
            recursive: "true",
          });

          const files = treeData.tree
            .filter((item) => item.type === "blob")
            .map((item) => ({
              path: item.path,
              sha: item.sha,
              size: item.size,
              type: item.type,
              url: item.url,
            }));

          const folders = treeData.tree
            .filter((item) => item.type === "tree")
            .map((item) => ({
              path: item.path,
              sha: item.sha,
              type: item.type,
            }));

          return NextResponse.json({
            branch: "master",
            sha: treeSha,
            files,
            folders,
            truncated: treeData.truncated,
          });
        } catch (masterError: any) {
          throw masterError;
        }
      }
      throw error;
    }
  } catch (error: any) {
    console.error("Error fetching repository tree:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch repository tree",
        details: error.message,
      },
      { status: error.status || 500 }
    );
  }
}
