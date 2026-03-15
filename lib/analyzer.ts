import { Analogy, Paragraph, RealParagraph, Tag, TagRelator, User, UserTag } from "./temporarytype";
import { analogy,tagUser,tagRelator,tag, realParagraph,user } from "@/datarelated/data";
export async function GetBestAnalogy(paragraph: RealParagraph, user: User): Promise<Analogy | null> {
    
    // 1. Filter analogies belonging to this specific RealParagraph
    const candidates = (analogy as Analogy[]).filter(ana => ana.ParagraphId === paragraph.id);
    if (!candidates.length) return null;

    // 2. Get the user's personality profile
    const userProfile = (tagUser as UserTag[]).filter(ut => ut.UserId === user.id);

    let winner: Analogy | null = null;
    let topScore = -Infinity;

    // Logic Gates
    const MIN_LIKE_RATIO = 0.6; // 60% positive rating required
    const MIN_MATCH_SCORE = 1.0; // Must have at least some relevance

    for (const ana of candidates) {
        let currentScore = 0;

        // --- GLOBAL QUALITY FILTER ---
        const globalTotal = ana.likes + ana.dislikes;
        const globalRatio = globalTotal > 0 ? ana.likes / globalTotal : 0.5;
        if (globalRatio < MIN_LIKE_RATIO && globalTotal > 10) continue;

        for (const ut of userProfile) {
            // Find the Relator that matches this Analogy + this User's Tag
            const relator = (tagRelator as TagRelator[]).find(tr => 
                tr.AnalogyId === ana.id && tr.TagId === ut.TagId
            );

            if (relator) {
                // Calculate Community Approval Ratio
                const communityTotal = relator.likes + relator.dislikes;
                const communityApproval = communityTotal > 0 
                    ? relator.likes / communityTotal 
                    : 0.5;

                // Personalized Score = User Interest (1-5) * Community Approval (0-1)
                currentScore += ut.likingLevel * communityApproval;
            }

            // --- PERSONALITY NEIGHBOR LOGIC ---
            const targetTag = (tag as Tag[]).find(t => t.id === ut.TagId);
            if (targetTag?.linkedWith?.length) {
                const neighborRelators = (tagRelator as TagRelator[]).filter(tr => 
                    tr.AnalogyId === ana.id && targetTag.linkedWith.includes(tr.TagId)
                );
                // Boost for related interests
                currentScore += neighborRelators.length * 0.5;
            }
        }

        // --- WINNER SELECTION ---
        if (currentScore >= MIN_MATCH_SCORE) {
            if (currentScore > topScore) {
                topScore = currentScore;
                winner = ana;
            } 
            // Tie-breaker: If scores match, pick the one with more global likes
            else if (currentScore === topScore && winner) {
                if (ana.likes > winner.likes) {
                    winner = ana;
                }
            }
        }
    }

    return winner;
}


export async function ChangeToBestAnalogy(initail_analogy: Analogy,paragraph: RealParagraph, user: User): Promise<Analogy | null>  
{
 // 1. Filter analogies belonging to this specific RealParagraph
    const candidates = (analogy as Analogy[]).filter(ana => ana.ParagraphId === paragraph.id);
    if (!candidates.length) return null;

    // 2. Get the user's personality profile
    const userProfile = (tagUser as UserTag[]).filter(ut => ut.UserId === user.id);

    let winner: Analogy | null = null;
    let topScore = -Infinity;

    // Logic Gates
    const MIN_LIKE_RATIO = 0.6; // 60% positive rating required
    const MIN_MATCH_SCORE = 1.0; // Must have at least some relevance

    for (const ana of candidates) {
        let currentScore = 0;

        // --- GLOBAL QUALITY FILTER ---
        const globalTotal = ana.likes + ana.dislikes;
        const globalRatio = globalTotal > 0 ? ana.likes / globalTotal : 0.5;
        if (globalRatio < MIN_LIKE_RATIO && globalTotal > 10) continue;

        for (const ut of userProfile) {
            // Find the Relator that matches this Analogy + this User's Tag
            const relator = (tagRelator as TagRelator[]).find(tr => 
                tr.AnalogyId === ana.id && tr.TagId === ut.TagId
            );

            if (relator) {
                // Calculate Community Approval Ratio
                const communityTotal = relator.likes + relator.dislikes;
                const communityApproval = communityTotal > 0 
                    ? relator.likes / communityTotal 
                    : 0.5;

                // Personalized Score = User Interest (1-5) * Community Approval (0-1)
                currentScore += ut.likingLevel * communityApproval;
            }

            // --- PERSONALITY NEIGHBOR LOGIC ---
            const targetTag = (tag as Tag[]).find(t => t.id === ut.TagId);
            if (targetTag?.linkedWith?.length) {
                const neighborRelators = (tagRelator as TagRelator[]).filter(tr => 
                    tr.AnalogyId === ana.id && targetTag.linkedWith.includes(tr.TagId)
                );
                // Boost for related interests
                currentScore += neighborRelators.length * 0.5;
            }
        }

        // --- WINNER SELECTION ---
        if (currentScore >= MIN_MATCH_SCORE) {
            if (currentScore > topScore) {
                topScore = currentScore;
                winner = ana;
            } 
            // Tie-breaker: If scores match, pick the one with more global likes
            else if (currentScore === topScore && winner) {
                if (ana.likes > winner.likes) {
                    winner = ana;
                }
            }
        }
    }

    return winner;
}
// Expermental
async function example(){
    const ans = await GetBestAnalogy(realParagraph[0], user[1]);
    console.log("Best Analogy:", ans);
}

example();