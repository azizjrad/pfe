<?php

namespace Tests\Feature;

use App\Mail\ContactReplyMail;
use App\Models\ContactMessage;
use App\Services\ContactService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class ContactReplyThreadTest extends TestCase
{
    use RefreshDatabase;

    public function test_contact_replies_are_appended_as_a_thread_and_keep_legacy_snapshot(): void
    {
        Mail::fake();

        $message = ContactMessage::create([
            'name' => 'Test Client',
            'email' => 'client@example.com',
            'phone' => '12345678',
            'subject' => 'Need help',
            'message' => 'Hello support',
            'is_read' => false,
            'submitted_at' => now(),
        ]);

        $service = new ContactService();

        $firstReply = $service->reply($message->id, 'First answer', 'admin1@example.com');

        Mail::assertSentTimes(ContactReplyMail::class, 1);
        $this->assertSame('First answer', $firstReply->admin_reply);
        $this->assertSame('admin1@example.com', $firstReply->replied_by_email);
        $this->assertSame(1, $firstReply->replies()->count());
        $this->assertSame(['First answer'], $firstReply->replies()->pluck('reply')->all());

        $secondReply = $service->reply($message->id, 'Second answer', 'admin2@example.com');

        Mail::assertSentTimes(ContactReplyMail::class, 2);
        $this->assertSame('Second answer', $secondReply->admin_reply);
        $this->assertSame('admin2@example.com', $secondReply->replied_by_email);
        $this->assertSame(2, $secondReply->replies()->count());
        $this->assertSame(
            ['First answer', 'Second answer'],
            $secondReply->replies()->pluck('reply')->all(),
        );

        $freshMessage = ContactMessage::with('replies')->findOrFail($message->id);
        $this->assertSame('Second answer', $freshMessage->admin_reply);
        $this->assertSame(2, $freshMessage->replies()->count());
        $this->assertTrue($freshMessage->is_read);
    }
}
