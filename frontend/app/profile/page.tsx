'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User, Award, Trophy, TrendingUp, Shield, Star } from 'lucide-react';
import { useState } from 'react';

export default function ProfilePage() {
    const [isEditing, setIsEditing] = useState(false);
    const [profile, setProfile] = useState({
        username: 'satoshi_trader',
        email: '[email protected]',
        bio: 'Long-distance trader specializing in secure Bitcoin transactions',
        kyc_level: 2,
        is_agent: false,
    });

    const reputation = {
        trust_score: 92,
        completed_deals: 47,
        dispute_count: 1,
        avg_response_time: 2340, // seconds
        badges: ['Verified Trader', 'Fast Responder', '50 Deals', 'Top Rated'],
    };

    const kycLevels = [
        { level: 0, label: 'None', desc: 'No verification' },
        { level: 1, label: 'Basic', desc: 'Email verified' },
        { level: 2, label: 'Verified', desc: 'ID verified' },
        { level: 3, label: 'Premium', desc: 'Full KYC' },
    ];

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            <div className="mb-8">
                <h1 className="text-4xl font-bold mb-2">Profile</h1>
                <p className="text-muted-foreground">Manage your account and reputation</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Profile */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <User className="w-6 h-6 text-primary" />
                                Profile Information
                            </CardTitle>
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => setIsEditing(!isEditing)}
                            >
                                {isEditing ? 'Cancel' : 'Edit'}
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                <div className="flex items-center gap-6">
                                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-4xl font-bold text-white">
                                        {profile.username[0].toUpperCase()}
                                    </div>
                                    <div className="flex-1">
                                        <h2 className="text-2xl font-bold mb-1">{profile.username}</h2>
                                        <p className="text-muted-foreground">{profile.email}</p>
                                    </div>
                                </div>

                                <Input
                                    label="Username"
                                    value={profile.username}
                                    disabled={!isEditing}
                                    onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                                />

                                <Input
                                    label="Email"
                                    type="email"
                                    value={profile.email}
                                    disabled={!isEditing}
                                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                                />

                                <div>
                                    <label className="block text-sm font-medium mb-2 text-foreground">
                                        Bio
                                    </label>
                                    <textarea
                                        value={profile.bio}
                                        disabled={!isEditing}
                                        onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                                        rows={3}
                                        className="input-modern resize-none"
                                    />
                                </div>

                                {isEditing && (
                                    <div className="flex gap-3">
                                        <Button className="flex-1">Save Changes</Button>
                                        <Button
                                            variant="secondary"
                                            className="flex-1"
                                            onClick={() => setIsEditing(false)}
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Reputation */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Trophy className="w-6 h-6 text-accent" />
                                Reputation
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                {/* Trust Score */}
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm text-muted-foreground">Trust Score</span>
                                        <span className="text-3xl font-bold gradient-text">{reputation.trust_score}</span>
                                    </div>
                                    <div className="w-full bg-secondary rounded-full h-3">
                                        <div
                                            className="bg-gradient-to-r from-primary to-accent h-3 rounded-full transition-all"
                                            style={{ width: `${reputation.trust_score}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Stats */}
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="bg-secondary/30 rounded-lg p-4 text-center">
                                        <p className="text-2xl font-bold">{reputation.completed_deals}</p>
                                        <p className="text-xs text-muted-foreground">Completed</p>
                                    </div>
                                    <div className="bg-secondary/30 rounded-lg p-4 text-center">
                                        <p className="text-2xl font-bold">{reputation.dispute_count}</p>
                                        <p className="text-xs text-muted-foreground">Disputes</p>
                                    </div>
                                    <div className="bg-secondary/30 rounded-lg p-4 text-center">
                                        <p className="text-2xl font-bold">{Math.floor(reputation.avg_response_time / 60)}m</p>
                                        <p className="text-xs text-muted-foreground">Avg Response</p>
                                    </div>
                                </div>

                                {/* Badges */}
                                <div>
                                    <p className="text-sm font-medium mb-3">Badges</p>
                                    <div className="flex flex-wrap gap-2">
                                        {reputation.badges.map((badge, idx) => (
                                            <div
                                                key={idx}
                                                className="flex items-center gap-2 px-3 py-1.5 bg-accent/20 border border-accent/30 rounded-full"
                                            >
                                                <Award className="w-4 h-4 text-accent" />
                                                <span className="text-sm font-medium">{badge}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* KYC Status */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Shield className="w-5 h-5 text-primary" />
                                KYC Status
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {kycLevels.map((lvl) => (
                                    <div
                                        key={lvl.level}
                                        className={`p-3 rounded-lg border transition-all ${profile.kyc_level === lvl.level
                                                ? 'bg-primary/20 border-primary'
                                                : 'bg-secondary/30 border-transparent'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="font-semibold">{lvl.label}</span>
                                            {profile.kyc_level === lvl.level && (
                                                <Star className="w-4 h-4 text-primary fill-primary" />
                                            )}
                                        </div>
                                        <p className="text-xs text-muted-foreground">{lvl.desc}</p>
                                    </div>
                                ))}
                                <Button variant="outline" className="w-full mt-3">
                                    Upgrade KYC
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Agent Status */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Agent Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                                    <span className="text-sm">Agent Account</span>
                                    <div className={`w-3 h-3 rounded-full ${profile.is_agent ? 'bg-accent' : 'bg-muted'}`} />
                                </div>
                                {!profile.is_agent && (
                                    <div>
                                        <p className="text-sm text-muted-foreground mb-3">
                                            Become an agent to help users cash in/out locally
                                        </p>
                                        <Button variant="outline" className="w-full">
                                            Apply as Agent
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Stats */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-accent" />
                                Activity
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Member since</span>
                                    <span className="font-semibold">Jan 2024</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Last active</span>
                                    <span className="font-semibold">2 hours ago</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Active escrows</span>
                                    <span className="font-semibold">3</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
