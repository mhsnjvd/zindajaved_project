from django.shortcuts import render, get_object_or_404
from django.shortcuts import redirect
from django.utils import timezone
from .models import Raag
from .forms import PostForm
from django.contrib.auth.decorators import login_required


def raag_list(request):
    raags = Raag.objects.filter(entry_publish_date__lte=timezone.now()).order_by('entry_publish_date')
    return render(request, 'music/raag_list.html', {'raags': raags})

def raag_detail(request, pk):
    raag = get_object_or_404(Raag, pk=pk)
    return render(request, 'music/raag_detail.html', {'raag': raag})


@login_required
def add_new_raag(request):
    if request.method == "POST":
        form = PostForm(request.POST)
        if form.is_valid():
            raag = form.save(commit=False)
            raag.entry_creator = request.user
            raag.save()
            return redirect('raag_detail', pk=raag.pk)
    else:
        form = PostForm()
    return render(request, 'music/raag_edit.html', {'form': form})


@login_required
def edit_raag(request, pk):
    raag = get_object_or_404(Raag, pk=pk)
    if request.method == "POST":
        form = PostForm(request.POST, instance=raag)
        if form.is_valid():
            raag = form.save(commit=False)
            raag.entry_creator = request.user
            raag.save()
            return redirect('raag_detail', pk=raag.pk)
    else:
        form = PostForm(instance=post)
    return render(request, 'music/raag_edit.html', {'form': form})

# @login_required
# def post_draft_list(request):
#     posts = Post.objects.filter(published_date__isnull=True).order_by('created_date')
#     return render(request, 'blog/post_draft_list.html', {'posts': posts})


@login_required
def publish_raag(request, pk): 
    raag = get_object_or_404(Post, pk=pk) 
    raag.publish() 
    return redirect('music.views.raag_detail', pk=pk)


# @login_required
# def post_remove(request, pk):
#     post = get_object_or_404(Post, pk=pk)
#     post.delete()
#     return redirect('blog.views.post_list')
# 
# 
# def add_comment_to_post(request, pk):
#     post = get_object_or_404(Post, pk=pk)
#     if request.method == "POST":
#         form = CommentForm(request.POST)
#         if form.is_valid():
#             comment = form.save(commit=False)
#             comment.post = post
#             comment.save()
#             return redirect('blog.views.post_detail', pk=post.pk)
#     else:
#         form = CommentForm()
#     return render(request, 'blog/add_comment_to_post.html', {'form': form})
# 
# 
# 
# @login_required
# def comment_approve(request, pk):
#     comment = get_object_or_404(Comment, pk=pk)
#     comment.approve()
#     return redirect('blog.views.post_detail', pk=comment.post.pk)
# 
# @login_required
# def comment_remove(request, pk):
#     comment = get_object_or_404(Comment, pk=pk)
#     post_pk = comment.post.pk
#     comment.delete()
#     return redirect('blog.views.post_detail', pk=post_pk)
