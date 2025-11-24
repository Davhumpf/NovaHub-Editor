import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { Octokit } from "@octokit/rest";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function GET(request: NextRequest) {
  try {
    // Get the user session
    const session = await getServerSession(authOptions);

    if (!session || !session.accessToken) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in with GitHub." },
        { status: 401 }
      );
    }

    // Initialize Octokit with user's access token
    const octokit = new Octokit({
      auth: session.accessToken,
    });

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get("type") || "all"; // all, owner, public, private, member
    const sort = searchParams.get("sort") || "updated"; // created, updated, pushed, full_name
    const per_page = parseInt(searchParams.get("per_page") || "100");
    const page = parseInt(searchParams.get("page") || "1");

    // Fetch repositories
    const { data: repos } = await octokit.repos.listForAuthenticatedUser({
      type: type as "all" | "owner" | "public" | "private" | "member",
      sort: sort as "created" | "updated" | "pushed" | "full_name",
      per_page,
      page,
    });

    // Transform data to include only necessary fields
    const transformedRepos = repos.map((repo) => ({
      id: repo.id,
      name: repo.name,
      full_name: repo.full_name,
      private: repo.private,
      owner: {
        login: repo.owner.login,
        avatar_url: repo.owner.avatar_url,
      },
      html_url: repo.html_url,
      description: repo.description,
      fork: repo.fork,
      created_at: repo.created_at,
      updated_at: repo.updated_at,
      pushed_at: repo.pushed_at,
      size: repo.size,
      stargazers_count: repo.stargazers_count,
      watchers_count: repo.watchers_count,
      language: repo.language,
      forks_count: repo.forks_count,
      open_issues_count: repo.open_issues_count,
      default_branch: repo.default_branch,
    }));

    return NextResponse.json({
      repos: transformedRepos,
      total: transformedRepos.length,
    });
  } catch (error: any) {
    console.error("Error fetching repositories:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch repositories",
        details: error.message
      },
      { status: 500 }
    );
  }
}
